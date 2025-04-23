import json
import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
table = dynamodb.Table('Tasks')

def lambda_handler(event, context):
    task_id = event['pathParameters']['id']
    data = json.loads(event['body'])
    
    response = table.update_item(
        Key={'id': task_id},
        UpdateExpression='SET title = :title, completed = :completed',
        ExpressionAttributeValues={
            ':title': data['title'],
            ':completed': data['completed']
        },
        ReturnValues="ALL_NEW"
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['Attributes'])
    }
