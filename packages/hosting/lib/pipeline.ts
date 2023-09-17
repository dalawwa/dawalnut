import { Stack, StackProps, aws_codepipeline_actions} from "aws-cdk-lib";
import { Construct } from "constructs";

import { Stage } from "./stage";
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline');

    pipeline.addStage(new Stage(this, 'Dev', {
      stageName: 'Dev',
      env: {
        account: '765757105156',
        region: 'eu-central-1',
      }
    }));

    pipeline.stage('Dev').addAction(new aws_codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub',
      owner: 'dalawwa',
      repo: 'dawalnut',
      branch: 'main',
      output: new codepipeline.Artifact(),
      connectionArn: process.env.CONNECTION_ARN!,
    }));

    const approveStage = pipeline.addStage({ stageName: 'Approve' });
    const manualApprovalAction = new aws_codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
    });
    approveStage.addAction(manualApprovalAction)
  }
}