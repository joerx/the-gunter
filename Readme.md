# The Gunter

A bot that knows only excuses. https://www.facebook.com/The-Gunter-158814821309361/. (Not sure
anybody can actually see this). Sandbox for building an FB bot backed by Lambda.

## AWS Setup

- Create Lambda function, API gateway, etc.
- Create file `.credentials` with your local settings, see below
- Run `npm install`, then `publish.sh`

```sh
# .credentials
AWS_ACCESS_KEY_ID=<your_access_key>
AWS_SECRET_ACCESS_KEY=<your_secret_key>
AWS_DEFAULT_REGION=<your_aws_region>

FB_VERIFY_TOKEN=<your_fb_verify_token>
FB_PAGE_TOKEN=<your_fb_page_token>
```

## Facebook Setup

- Create FB page and app
- Verify webhook using the API gateway endpoint
