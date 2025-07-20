import './src/boilerplate.polyfill';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { TlsOptions } from 'tls';
import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

dotenv.config();

const isSSL: boolean = process.env.DB_SSL === 'true';
const dbSSLCa = process.env.DB_SSL_CA;

const ssl: TlsOptions = isSSL
  ? {
      rejectUnauthorized: true,
      ca: dbSSLCa,
    }
  : {};

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: [UserSubscriber],
  entities: [
    'src/modules/**/*.entity{.ts,.js}',
    'src/modules/**/*.view-entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  ...(isSSL ? { ssl } : {}),
});
