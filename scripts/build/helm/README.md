# CHT Helm Chart

This directory contains the [Helm](https://helm.sh/) chart for deploying the [Community Health Toolkit (CHT)](https://communityhealthtoolkit.org/) on Kubernetes clusters.

## Overview

Deploying the CHT involves multiple configuration parameters for CouchDB, your environment format, and the platform (EKS, GKE, K3s, etc.). The values files are structured modularly to make deployment and maintenance easier, allowing you to compose multiple values files together using Helm's `-f` flag.

## Configuration Structure

The configuration files are located under the `values/` directory. When deploying, you must provide your required configuration by extending `base.yaml`.

* `values/base.yaml`: Contains the core configuration used across **all** environments. **You must override** fields here such as `project_name`, `namespace`, CouchDB `password`, `secret`, and `uuid`.
* **Deployment Topology options:**
  * `values/deployment-single.yaml`: Configures the CHT to use a single CouchDB node (`clusteredCouchEnabled: false`). Best for small or basic deployments.
  * `values/deployment-multi.yaml`: Configures the CHT to use a clustered CouchDB topology with 3 nodes.
* **Platform options:**
  * `values/platform-eks.yaml`: Configurations specific to deploying on Amazon EKS (e.g., ALB Ingress, EBS volumes).
  * `values/platform-gke.yaml`: Configurations specific to deploying on Google GKE (e.g., GCE Ingress, GCP Persistent Disks).
  * `values/platform-k3s-k3d.yaml`: Configurations specific to deploying locally via K3s/K3d, featuring local host path storage.

## Required Values

At a minimum, any deployment must specify the following values (usually by providing your own override file or providing them via `--set`):

* `project_name`
* `namespace`
* `couchdb.password`
* `couchdb.secret`
* `couchdb.uuid`
* `couchdb.couchdb_node_storage_size` (if you are provisioning new data disks)

## Deployment Scenarios

Helm allows merging multiple files together. The last file specified overrides any identical keys from the previous files.

### 1. Local Development (Single Node on K3s/K3d)

To deploy locally using a single CouchDB node on K3d:

```bash
helm install cht-release ./cht-chart \
  -f values/base.yaml \
  -f values/deployment-single.yaml \
  -f values/platform-k3s-k3d.yaml \
  --set project_name="my-local-cht" \
  --set namespace="cht-namespace" \
  --set couchdb.password="adminpass" \
  --set couchdb.secret=$(uuidgen) \
  --set couchdb.uuid=$(uuidgen)
```

### 2. AWS EKS Production (Multi-Node CouchDB Cluster)

To deploy on EKS with a 3-node CouchDB cluster:

```bash
helm install cht-release ./cht-chart \
  -f values/base.yaml \
  -f values/deployment-multi.yaml \
  -f values/platform-eks.yaml \
  --set project_name="my-prod-cht" \
  --set namespace="cht-prod" \
  --set couchdb.password="securepassword" \
  --set couchdb.secret=$(uuidgen) \
  --set couchdb.uuid=$(uuidgen) \
  --set "nodes.node-1"="eks-node-group-a" \
  --set "nodes.node-2"="eks-node-group-b" \
  --set "nodes.node-3"="eks-node-group-c"
```

### 3. Google GKE Staging (Single Node)

To deploy on GKE with a single CouchDB node:

```bash
helm install cht-release ./cht-chart \
  -f values/base.yaml \
  -f values/deployment-single.yaml \
  -f values/platform-gke.yaml \
  --set project_name="my-staging-cht" \
  --set namespace="cht-staging" \
  --set couchdb.password="securepassword" \
  --set couchdb.secret=$(uuidgen) \
  --set couchdb.uuid=$(uuidgen) \
  --set couchdb.persistent_disk.size="100Gi"
```

## Persistent Data & Pre-existing Disks

If you are attaching pre-existing disks to your CouchDB deployment (so it does not create new empty volumes), you must set `couchdb_data.preExistingDataAvailable: true`. Depending on your platform, you will also need to populate the pre-existing disk IDs in the respective platform file:
* **EKS**: Provide `ebs.preExistingEBSVolumeID-1`, `2`, `3`
* **GKE**: Provide `couchdb.persistent_disk.diskName-1`, `2`, `3`
* **K3s (Local)**: Configure `local_storage.preExistingDiskPath-1`, `2`, `3` 
