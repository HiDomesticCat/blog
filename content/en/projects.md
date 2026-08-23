+++
title = "Projects"
slug = "projects"
description = "Projects and research by Jing-Ping Yu (hicat0x0): zero-knowledge encrypted cloud storage, log anomaly detection, photo provenance verification, quantum and parallel algorithm visualisation and machine learning."
+++

Projects and research directions I lead or contribute to.
The full list lives on
[GitHub @HiDomesticCat](https://github.com/HiDomesticCat?tab=repositories).

---

## Security & Systems Research

### DCFS — Zero-Knowledge Encrypted Cloud File System

A cloud file system on AWS serverless infrastructure, built around the idea that
the server should never see your files.
Files marked private are encrypted in the browser before they leave it:
a master key (MEK) is derived from a separate encryption passphrase via PBKDF2,
each file gets a one-time data key (DEK) that encrypts the contents with AES-GCM,
and the DEK itself is wrapped under the MEK before being uploaded alongside the IV —
so the server only ever holds ciphertext and a wrapped key.

Access is split across three roles (anonymous visitor, user, administrator),
transfers use S3 pre-signed URLs, metadata lives in DynamoDB,
and Cognito issues the JWTs used for authentication.

- **Stack**: AWS Lambda (Node.js), API Gateway, S3, DynamoDB, Cognito, Web Crypto API
- **Source**: [aws_finalwork](https://github.com/HiDomesticCat/aws_finalwork)

---

### DeepCASE Log Correlation & Anomaly Detection

Semi-supervised correlation analysis over syslog event sequences.
It learns relationships between events and flags anomalous patterns
(for example SSH brute-force attempts), with the goal of reducing
alert fatigue in security operations.
Supports rsyslog, remote hosts and file sources, and can deliver alerts
to the console, email, webhooks or Slack.

- **Stack**: Python, PyTorch, scikit-learn, DeepCASE
- **Source**: [deepCASE_research](https://github.com/HiDomesticCat/deepCASE_research)

---

### SpectraLens — Photo Provenance Verification

A proof of concept for verifying that a photo really was taken
*by this device, at this location*.
A Flutter capture app on the front end talks to a FastAPI backend that issues
signing challenges and validates uploads, chaining together WebAuthn/Passkey
device binding, Google Play Integrity device attestation and geolocation data.

Still at PoC stage — the external verification calls are currently mocked.

- **Stack**: Flutter / Dart, FastAPI, WebAuthn, Play Integrity API
- **Source**: [YummYYummY](https://github.com/HiDomesticCat/YummYYummY) (app) /
  [YummYYummY_backend](https://github.com/HiDomesticCat/YummYYummY_backend) (backend)

---

### WannaMock — File Encryption from Scratch

An educational project implementing a file encryption pipeline in C:
recursive directory traversal, binary file I/O, and a cipher that evolved
from a simple Caesar shift to RSA with a hand-written fast modular
exponentiation routine.
The write-up documents the memory-overflow and file-corruption problems
hit at each iteration.

For academic and teaching purposes only, released under GPL-3.0.

- **Stack**: C, GCC, RSA, fast modular exponentiation
- **Source**: [WannaMock_virus_program](https://github.com/HiDomesticCat/WannaMock_virus_program)

---

## Algorithms, Machine Learning & Visualisation

### Grover's Algorithm Visualiser

An interactive teaching tool for quantum search.
It walks through superposition, phase inversion and amplitude amplification
step by step, letting you pick a target state and watch the probability
concentrate on the search result.
The backend simulates the actual quantum circuit with Qiskit,
with an optional noise model.

- **Stack**: React, TypeScript, FastAPI, Qiskit
- **Source**: [Grover-demo](https://github.com/HiDomesticCat/Grover-demo)

---

### Hypercube Routing Visualiser

Compares five routing algorithms on hypercube networks
(BFS, A\*, beam search, Batcher sorting and more), replaying the search
step by step and running statistical comparisons across dimensions.
All third-party libraries are vendored locally so it runs offline.

- **Stack**: React, custom design-token styling system
- **Source**: [Hypercube-demo](https://github.com/HiDomesticCat/Hypercube-demo)

---

### sushi-sync — Operating System Synchronisation Simulator

Uses competition for seats in a sushi restaurant to demonstrate OS
multi-threading, resource allocation and synchronisation primitives
(mutexes, condition variables).
Features a live floor plan, seat configuration, timeline scrubbing and
OS-oriented metrics — throughput, turnaround time, wait time —
exportable to JSON, CSV or plain text.

- **Stack**: Svelte 5, Tailwind CSS, Rust, Tauri
- **Source**: [sushi-sync](https://github.com/HiDomesticCat/sushi-sync)

---

### PSO-ANN-XOR — Training a Neural Network with Particle Swarm Optimisation

Solves XOR with a 2-2-1 neural network trained by particle swarm optimisation
instead of backpropagation: 50 particles, up to 2000 iterations,
early stopping once loss drops below 0.001, plus a convergence chart.

- **Stack**: Rust, `rand`, `plotters`
- **Source**: [PSO-ANN-XOR](https://github.com/HiDomesticCat/PSO-ANN-XOR)

---

### MNIST — Training and Serving a CNN

Handwritten digit recognition with a convolutional neural network,
focused on what happens *after* training: exporting to SavedModel,
serving REST and gRPC through TensorFlow Serving, packaging CPU and GPU
environments with Docker, and training on GPU while exporting for
CPU-only inference hosts.

- **Stack**: TensorFlow, TensorFlow Serving, Docker
- **Source**: [MNIST](https://github.com/HiDomesticCat/MNIST)

---

## Applications & Coursework

### Product Search System

A database course project: a full-stack product search and shopping cart
application supporting keyword search, category browsing and cart operations.
All database access goes through parameterised queries to prevent SQL injection.

- **Stack**: Python Flask, SQLite3, HTML / CSS / JavaScript
- **Source**: [NUTN_DataBase_project](https://github.com/HiDomesticCat/NUTN_DataBase_project)

---

## Sites & Notes

### hicat0x0 Blog

This blog. Built with Hugo and the hugo-coder theme, deployed to GitHub Pages.
It collects CTF write-ups, security research notes and study logs.

- **Stack**: Hugo, Markdown, GitHub Actions, GitHub Pages
- **Link**: [blog.hicat0x0.uk](https://blog.hicat0x0.uk)
- **Source**: [blog](https://github.com/HiDomesticCat/blog)

---

### Open Notes

Course notes, learning resources and technical documents organised into a
browsable site, published openly for classmates and the community.

- **Stack**: Logseq
- **Link**: [note.hicat0x0.uk](https://note.hicat0x0.uk)
- **Source**: [nutn_note](https://github.com/HiDomesticCat/nutn_note)
