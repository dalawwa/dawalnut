#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Pipeline } from '../lib/pipeline';

const app = new cdk.App();
new Pipeline(app, 'MySite');
