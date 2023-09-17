#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Pipeline } from '../lib/pipeline';
import 'dotenv/config';

const app = new cdk.App();
new Pipeline(app, 'MySite', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});
