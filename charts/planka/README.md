# PLANKA Helm Chart

This Helm Chart simplifies the deployment of [PLANKA](https://github.com/plankanban/planka) on Kubernetes.

Shoutout to [this issue](https://github.com/plankanban/planka/issues/192) for requesting a Helm Chart!

## Issues

By using the Bitnami chart for PostgreSQL, there is an issue where once deployed, if trying to use a different password then it will be ignored as the Persistant Volume (PV) will already exist with the previous password. See warning from Bitnami below:

> **Warning!** Setting a password will be ignored on new installation in the case when previous Posgresql release was deleted through the helm command. In that case, old PVC will have an old password, and setting it through helm won't take effect. Deleting persistent volumes (PVs) will solve the issue. Refer to [issue 2061](https://github.com/bitnami/charts/issues/2061) for more details

If you want to fully uninstall this chart including the data, follow [these steps](https://github.com/bitnami/charts/blob/main/bitnami/postgresql/README.md#uninstalling-the-chart) from the Bitnami Chart's docs.

## Usage

If you just want to spin up an instance using help, please see [these docs](https://docs.planka.cloud/docs/installation/kubernetes/helm-chart/). If you want to make changes to the chart locally, and deploy them, see the below section.

## Local Building and Using the Chart

The basic usage of the chart can be found below:

```bash
git clone https://github.com/plankanban/planka.git
cd planka/charts/planka
helm dependency build
export SECRETKEY=$(openssl rand -hex 64)
helm install planka . --set secretkey=$SECRETKEY  \
--set admin_email="demo@demo.demo"  \
--set admin_password="demo"  \
--set admin_name="Demo Demo" \
--set admin_username="demo"
```

> **Note:** The command `openssl rand -hex 64` is needed to create a random hexadecimal key for planka. On Windows you can use Git Bash to run that command.

To access PLANKA you can port forward using the following command:

```bash
kubectl port-forward $POD_NAME 3000:1337
```

### Accessing Externally

To access PLANKA externally you can use the following configuration

```bash
# HTTP only
helm install planka . --set secretkey=$SECRETKEY \
--set admin_email="demo@demo.demo"  \
--set admin_password="demo"  \
--set admin_name="Demo Demo" \
--set admin_username="demo" \
--set ingress.enabled=true \
--set ingress.hosts[0].host=planka.example.dev \

# HTTPS
helm install planka . --set secretkey=$SECRETKEY \
--set admin_email="demo@demo.demo"  \
--set admin_password="demo"  \
--set admin_name="Demo Demo" \
--set admin_username="demo" \
--set ingress.enabled=true \
--set ingress.hosts[0].host=planka.example.dev \
--set ingress.tls[0].secretName=planka-tls \
--set ingress.tls[0].hosts[0]=planka.example.dev \
```

or create a values.yaml file like:

```yaml
secretkey: "<InsertSecretKey>"
# The admin section needs to be present for new instances of PLANKA, after the first start you can remove the lines starting with admin_. If you want the admin user to be unchangeable admin_email: has to stay
# After changing the config you have to run ```helm upgrade  planka . -f values.yaml```

# Admin user
admin_email: "demo@demo.demo" # Do not remove if you want to prevent this user from being edited/deleted
admin_password: "demo"
admin_name: "Demo Demo"
admin_username: "demo"
# Admin user

# Ingress
ingress:
  enabled: true
  hosts:
    - host: planka.example.dev
      paths:
        - path: /
          pathType: ImplementationSpecific

# Needed for HTTPS
  tls:
   - secretName: planka-tls # existing TLS secret in k8s
     hosts:
       - planka.example.dev
```

```bash
helm install planka . -f values.yaml
```

### Things to consider if production hosting

If you want to host PLANKA for more than just playing around with, you might want to do the following things:

- Create a `values.yaml` with your config, as this will make applying upgrades much easier in the future.
- Create your `secretkey` once and store it either in a secure vault, or in your `values.yaml` file so it will be the same for upgrading in the future.
- Specify a password for `postgresql.auth.password` as there have been issues with the postgresql chart generating new passwords locking you out of the data you've already stored. (see [this issue](https://github.com/bitnami/charts/issues/2061))

Any questions or concerns, [raise an issue](https://github.com/Chris-Greaves/planka-helm-chart/issues/new).

## Advanced Configuration

### Extra Volume Mounts

The Helm chart supports mounting arbitrary ConfigMaps, Secrets, and Volumes to the PLANKA deployment using the `extraMounts` configuration. This is especially useful for scenarios like:

- Mounting custom CA certificates for OIDC with self-hosted identity providers
- Adding custom configuration files
- Mounting TLS certificates from existing secrets
- Adding temporary or persistent storage volumes

**Note**: ConfigMaps and Secrets must be created separately before referencing them in `extraMounts`.

#### Basic Usage

Use the `extraMounts` section to mount any type of volume:

```yaml
extraMounts:
  # Mount CA certificate from existing ConfigMap
  - name: ca-certs
    mountPath: /etc/ssl/certs/custom-ca.crt
    subPath: ca.crt
    readOnly: true
    configMap:
      name: ca-certificates  # Must exist

  # Mount TLS certificates from existing Secret
  - name: tls-certs
    mountPath: /etc/ssl/private
    readOnly: true
    secret:
      secretName: planka-tls-secret  # Must exist
      items:
        - key: tls.crt
          path: server.crt
        - key: tls.key
          path: server.key

  # Temporary storage
  - name: temp-storage
    mountPath: /tmp/planka-temp
    readOnly: false
    emptyDir:
      sizeLimit: 1Gi

  # Host path mount
  - name: backup-storage
    mountPath: /var/lib/planka-backups
    readOnly: false
    hostPath:
      path: /var/lib/planka-backups
      type: DirectoryOrCreate

  # NFS mount
  - name: nfs-storage
    mountPath: /shared/data
    readOnly: false
    nfs:
      server: nfs.example.com
      path: /exports/planka
```

### OIDC with Self-Hosted Keycloak

A common use case is configuring OIDC with a self-hosted Keycloak instance that uses custom CA certificates.

First, create the CA certificate ConfigMap:
```bash
kubectl create configmap ca-certificates --from-file=ca.crt=/path/to/your/ca.crt
```

Then configure the chart:
```yaml
# Mount custom CA certificate from existing ConfigMap
extraMounts:
  - name: keycloak-ca
    mountPath: /etc/ssl/certs/keycloak-ca.crt
    subPath: ca.crt
    readOnly: true
    configMap:
      name: ca-certificates

# Configure Node.js to trust the custom CA
extraEnv:
  - name: NODE_EXTRA_CA_CERTS
    value: "/etc/ssl/certs/keycloak-ca.crt"

# Enable OIDC
oidc:
  enabled: true
  clientId: "planka-client"
  clientSecret: "your-client-secret"
  issuerUrl: "https://keycloak.example.com/realms/master"
  admin:
    roles:
      - "planka-admin"
```

### Environment Variables from Secrets

You can reference values from existing secrets in environment variables:

```yaml
extraEnv:
  - name: SMTP_PASSWORD
    valueFrom:
      secretName: smtp-credentials
      key: password
  - name: CUSTOM_API_KEY
    valueFrom:
      secretName: api-credentials
      key: api-key
```

### Complete Example

See `values-example.yaml` for a comprehensive example that demonstrates all the advanced features including OIDC configuration with custom CA certificates.
