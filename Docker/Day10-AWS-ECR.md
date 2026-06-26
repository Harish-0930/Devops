# Day 10 — AWS ECR (Elastic Container Registry)

> Today: what AWS ECR is, why teams use it, and the full authenticate → create → push → pull workflow.

---

## 1. What is AWS ECR?

**Amazon Elastic Container Registry (ECR)** is AWS's **fully managed Docker image registry**. It's the AWS-native alternative to Docker Hub: a private (or public) place to store, version, and distribute your container images.

You'll usually use ECR as the registry in **Approach 1** from Day 02 (move images via a registry), especially when deploying to AWS compute like **ECS, EKS, Fargate, or EC2**.

### Why ECR?

| Benefit | Detail |
|---|---|
| **Managed** | No registry server to run or patch. |
| **Private & secure** | Images are private by default; access is controlled by **IAM**. |
| **Integrated** | First-class with ECS, EKS, Fargate, CodeBuild/CodePipeline. |
| **Encrypted** | Images encrypted at rest (KMS) and in transit. |
| **Scanning** | Built-in vulnerability scanning of pushed images. |
| **Lifecycle policies** | Auto-expire old/untagged images to control cost. |

### Private vs Public ECR

- **Private registry** — `<account-id>.dkr.ecr.<region>.amazonaws.com` — for your internal images (the common case).
- **Public registry** — `public.ecr.aws` — for images you want to share publicly (like Docker Hub public repos).

---

## 2. Prerequisites

- AWS CLI installed and configured (`aws configure`) with credentials.
- An IAM user/role with ECR permissions (e.g. `AmazonEC2ContainerRegistryFullAccess`, or scoped push/pull permissions).
- Docker installed.

```bash
aws --version
aws sts get-caller-identity     # confirm which identity you're using
```

---

## 3. Create a Repository

```bash
aws ecr create-repository \
  --repository-name myapp \
  --region ap-south-1 \
  --image-scanning-configuration scanOnPush=true
```

Each **repository** holds the versions (tags) of one image — similar to a repo on Docker Hub.

---

## 4. Authenticate Docker to ECR

ECR uses a temporary token. Pipe it straight into `docker login`:

```bash
aws ecr get-login-password --region ap-south-1 \
  | docker login --username AWS \
  --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com
```

- `--username` is always the literal `AWS`.
- The token is valid for **12 hours**; re-run when it expires.
- For **public** ECR: `aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws`.

---

## 5. Push an Image

```bash
# 1. Build your image
docker build -t myapp:1.0 .

# 2. Tag it with the full ECR repository URI
docker tag myapp:1.0 \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com/myapp:1.0

# 3. Push
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/myapp:1.0
```

---

## 6. Pull an Image

On any machine/role authenticated to ECR (an EC2 instance, ECS task, EKS node):

```bash
docker pull <account-id>.dkr.ecr.ap-south-1.amazonaws.com/myapp:1.0
```

> On AWS compute, prefer attaching an **IAM role** (instance profile / task role) so the host can pull from ECR without storing long-lived credentials.

---

## 7. Useful ECR Commands

```bash
aws ecr describe-repositories                          # list repos
aws ecr list-images --repository-name myapp            # list image tags/digests
aws ecr describe-images --repository-name myapp        # image details + scan status

# Delete a specific image tag
aws ecr batch-delete-image \
  --repository-name myapp \
  --image-ids imageTag=1.0

# Delete a repository (and all images in it)
aws ecr delete-repository --repository-name myapp --force
```

---

## 8. Lifecycle Policies (cost control)

ECR storage costs money, and old/untagged images pile up. A **lifecycle policy** auto-expires them — for example, "keep only the 10 most recent images":

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    }
  ]
}
```

```bash
aws ecr put-lifecycle-policy \
  --repository-name myapp \
  --lifecycle-policy-text file://policy.json
```

---

## 9. The Full Workflow at a Glance

```
aws configure
        |
        v
aws ecr create-repository --repository-name myapp
        |
        v
aws ecr get-login-password | docker login ...   (authenticate)
        |
        v
docker build  ->  docker tag <ecr-uri>  ->  docker push <ecr-uri>
        |
        v
(on AWS compute) docker pull <ecr-uri>  ->  run via ECS / EKS / EC2
```

---

## Quick Recap

- ECR = AWS's **managed Docker registry**; private by default, secured by **IAM**, integrated with ECS/EKS/Fargate.
- Workflow: **create-repository → get-login-password | docker login → build → tag → push → pull**.
- Tag images with the full URI: `<account-id>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>`.
- The login token lasts **12 hours**; on AWS compute use **IAM roles** instead of static creds.
- Use **lifecycle policies** and **scan-on-push** to control cost and catch vulnerabilities.
