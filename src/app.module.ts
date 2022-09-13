import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { MemoModule } from './memo/memo.module';
import { Memo } from './memo/entities/memo.entity';
import { MemoGroup } from './memo/entities/memo-group.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
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
          database: process.env.DB_NAME,
        }),
      synchronize: process.env.NODE_ENV !== 'prod',
      entities: [User, Verification, MemoGroup, Memo],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }) => {
        {token: req.headers['x-jwt']}
      }
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
    AuthModule,
    MemoModule,   
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
