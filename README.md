# Bedrock Chatbot with Cognito Authentication

Amazon Bedrock を使用したチャットボットアプリケーションで、Amazon Cognito による認証機能を備えています。

## 機能

- Amazon Bedrock の LLM モデル（Nova Lite または Claude）を使用したチャット機能
- Amazon Cognito によるユーザー認証
- API Gateway による安全な API アクセス
- CloudFront + S3 によるフロントエンドホスティング
- AWS CDK を使用したインフラのコード化

## アーキテクチャ

![Architecture Diagram](./architecture.png)

## 前提条件

- [Node.js](https://nodejs.org/) (v14 以上)
- [AWS CLI](https://aws.amazon.com/cli/) (設定済み)
- [AWS CDK](https://aws.amazon.com/cdk/) (v2)
- [Python](https://www.python.org/) (v3.9 以上)

## セットアップ手順

### 1. リポジトリのクローン

```
bash
git clone <repository-url>
cd simplechat
```

### 2. CDK プロジェクトの依存関係
```
npm install
```

### 3. フロントエンドの依存関係
```
cd frontend
npm install
cd ..
```


### 4. AWS アカウントのブートストラップ（初回のみ）
```
npx cdk bootstrap
```

### 5. フロントエンドのビルド 

```
cd frontend
npm run build
cd ..
```

### 6. CDK スタックのデプロイ
```
npx cdk deploy
```

デプロイが完了すると、以下の出力が表示されます：

```
CloudFront URL
API Gateway URL
Cognito User Pool ID
Cognito User Pool Client ID
使用している Bedrock モデル ID
```

### 7. フロントエンド環境変数の設定
frontend/.env ファイルを編集して、デプロイ出力から得られた値を設定します：
```
REACT_APP_API_ENDPOINT=<API_Gateway_URL>
REACT_APP_USER_POOL_ID=<User_Pool_ID>
REACT_APP_USER_POOL_CLIENT_ID=<User_Pool_Client_ID>
REACT_APP_REGION=us-east-1
```

### 8. フロントエンドの再ビルドとデプロイ
```
cd frontend
npm run build
cd ..
npx cdk deploy
```


### 9. アプリケーションへのアクセス
デプロイ出力に表示された CloudFront URL にアクセスしてアプリケーションを使用します。

使用方法
CloudFront URL にアクセスします
「サインアップ」をクリックして新しいアカウントを作成します
登録したメールアドレスに送信された確認コードを入力します
ログイン後、チャットインターフェースが表示されます
メッセージを入力して Amazon Bedrock モデルと対話します
カスタマイズ
別の Bedrock モデルの使用
bin/bedrock-chatbot.ts ファイルを編集して、使用するモデルを変更できます：

```
typescript 

new BedrockChatbotStack(app, 'BedrockChatbotStack', {
  modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
  // ...
});
```

### フロントエンドのカスタマイズ
フロントエンドのコードは frontend/src ディレクトリにあります。React コンポーネントを編集してカスタマイズできます。

### クリーンアップ
プロジェクトのリソースを削除するには：

```
npx cdk destroy
```


### トラブルシューティング
# API 呼び出しエラー
Cognito トークンが正しく設定されているか確認してください
API Gateway の CORS 設定が正しいか確認してください
CloudWatch Logs で Lambda 関数のログを確認してください

# 認証エラー
ユーザープールの設定を確認してください
フロントエンドの環境変数が正しく設定されているか確認してください
