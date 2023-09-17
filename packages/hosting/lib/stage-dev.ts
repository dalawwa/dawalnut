import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { HostingStack } from "./hosting-stack";

export class DevStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new HostingStack(this, "Hosting", props);
  }
}
