import { Stack, StackProps, aws_codepipeline} from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline');

    pipeline.addStage(new DevStage(this, 'Dev', {
      stageName: 'Dev',
      env: {
        account: '765757105156',
        region: 'eu-central-1',
      }
    }));
  }
}