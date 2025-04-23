import json
import uuid
import boto3

dynamodb = boto3.resource("dynamodb", endpoint_url="http://localstack:4566")
table = dynamodb.Table("Tasks")

def lambda_handler(event, context):
    data = json.loads(event["body"])
    item = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "completed": False
    }
    table.put_item(Item=item)
    return {
        "statusCode": 201,
        "body": json.dumps(item)
    }
