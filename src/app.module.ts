import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Context } from 'apollo-server-core';
import * as Joi from 'joi';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { JwtModule } from './jwt/jwt.module';
import { MailModule } from './mail/mail.module';
import { MemoGroupMembers } from './memo/entities/memo-group-members';
import { MemoGroup } from './memo/entities/memo-group.entity';
import { MemoTags } from './memo/entities/memo-tags';
import { Memo } from './memo/entities/memo.entity';
import { Tags } from './memo/entities/tags';
import { MemoModule } from './memo/memo.module';
import { UploadsModule } from './uploads/uploads.module';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === "production",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production')
          .required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        PRIVATE_KEY: Joi.string().required(),
        SENDGRID_API_KEY: Joi.string().required(),
        SENDGRID_FROM_EMAIL: Joi.string().required(),
        SENDGRID_FROM_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
      ? { url: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        }),
      synchronize: true,
      entities: [User, Verification, MemoGroup, Memo, MemoGroupMembers, Tags, MemoTags]
    }),
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: Context<any>) => {
              const { connectionParams, extra } = context;
              extra.token = connectionParams['x-jwt'];
            },
          },
          // 'subscriptions-transport-ws': {
          //   onConnect: (connectionParams: any) => ({
          //     token: connectionParams['x-jwt'],
          //   }),
          // },
        },
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: process.env.NODE_ENV !== 'production',
        context: ({ req, extra }) => {
          if (extra) {
            return { token: extra.token };
          } else {
            return { token: req.headers['x-jwt'] };
          }
        },
        cache: "bounded"
      }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({
      apiKey: process.env.SENDGRID_API_KEY,
      fromMail: process.env.SENDGRID_FROM_EMAIL,
      url: process.env.SENDGRID_FROM_URL,
    }), 
    UsersModule,
    MemoModule,
    CommonModule,
    AuthModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  /* 
  * 1. token을 request로 보냄
  * 2. request를 JwtMiddleware가 먼저 받게 됨
  * 3. JwtMiddleware가 token을 찾고 request user에 넣어줌
  * 4. request가 Graphql에 와서 context안으로 들어옴
  * 5. context가 매 request마다 호출되고 있으므로 context를 함수 호출시 HTTP request property가 주어짐
  * 6. resolver가 context에 접근 가능  
  */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
