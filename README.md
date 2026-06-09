# monorepo-course

## AWS Roadmap

### Phase 1 Assumptions
- Первый этап учебный, только для `learn-aws-dev`; `staging` и `prod` пока не трогаем.
- `aws-infra` остаётся отдельным соседним git-репозиторием, а не папкой внутри текущего monorepo.
- `CI/CD`, `GitHub Actions`, `OIDC`, `Nginx`, `HTTPS`, `domain`, `bastion`, `DynamoDB` и `ECR` не входят в первую итерацию.
- Для простоты наружу открываются сами service ports; позже это будет заменено на reverse proxy или `ALB`.
- Если при реализации окажется, что `payments-service` ещё не доведён до production deployment parity, он входит в ближайший подготовительный app-шаг до первого `EC2` deploy.
