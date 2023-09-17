#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Pipeline } from '../lib/pipeline';
import 'dotenv/config';

const app = new cdk.App();
new Pipeline(app, 'MySite', {
  env: {
    account: '765757105156',
    region: 'eu-central-1',
  }
});
app.synth();