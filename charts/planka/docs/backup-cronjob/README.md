# Planka backup CronJob

This optional Helm feature uses the backup image published from:

<https://github.com/sinae99/planka-k8s-backup>

The image follows Planka's official Docker backup layout:

```text
<timestamp>-backup/
├── postgres.sql
└── data/
```

## 1. Publish the image

Publish a version to GHCR using the
[backup repository guide](https://github.com/sinae99/planka-k8s-backup/blob/main/guide/publish-to-ghcr.md).
The default image is:

```text
ghcr.io/sinae99/planka-k8s-backup:1.0.0
```

Make the GHCR package public so Kubernetes can pull it without a registry
Secret. Use the exact tag you published in Helm.

## 2. Create the S3 Secret

```bash
kubectl -n planka create secret generic planka-backup-s3 \
  --from-literal=S3_ENDPOINT=https://s3.example.com \
  --from-literal=S3_ACCESS_KEY=replace-me \
  --from-literal=S3_SECRET_KEY=replace-me \
  --from-literal=S3_BUCKET_NAME=planka-backups \
  --from-literal=S3_PREFIX=planka
```

## 3. Enable backup in Helm

Add this to your Planka values file:

```yaml
backup:
  enabled: true
  image:
    repository: ghcr.io/sinae99/planka-k8s-backup
    tag: 1.0.0
  existingSecret: planka-backup-s3
```

Then upgrade the release:

```bash
helm upgrade --install planka planka/planka \
  --namespace planka \
  --create-namespace \
  -f values.yaml
```

The chart creates the CronJob, ServiceAccount, and namespace-scoped RBAC.
The default schedule is weekly.

## 4. Test it

```bash
kubectl -n planka create job planka-backup-manual \
  --from=cronjob/planka-backup
kubectl -n planka logs -f job/planka-backup-manual
kubectl -n planka delete job planka-backup-manual
```

Confirm the archive appears in the configured bucket. Test a restore before
using the backup in production.
