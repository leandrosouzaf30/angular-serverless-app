#!/bin/bash

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
unset AWS_SESSION_TOKEN
unset AWS_PROFILE

cd terraform

terraform destroy
rm -rf .terraform terraform.tfstate*

terraform init
terraform apply -auto-approve
