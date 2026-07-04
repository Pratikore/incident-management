-- Seed data: 10 sample incidents loaded at startup for demo/first-run.
-- Runs after Hibernate creates the schema (spring.jpa.defer-datasource-initialization=true)
-- and only for embedded databases by default (spring.sql.init.mode=embedded).
-- Each insert is guarded on `seq` so restarts never create duplicates.

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000001', 'Login service returning 500s',
       'Users intermittently receive HTTP 500 when signing in. Error rate ~8% on the auth service.',
       'HIGH', 'APPLICATION', 'OPEN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 1);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000002', 'Primary database CPU at 95%',
       'The primary Postgres instance is sustaining 95% CPU. Query latency has doubled.',
       'CRITICAL', 'DATABASE', 'IN_PROGRESS', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 2);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000003', 'VPN gateway packet loss',
       'Remote users report 15-20% packet loss through the west-region VPN gateway.',
       'MEDIUM', 'NETWORKING', 'OPEN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 3);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000004', 'Disk space low on log server',
       'Log aggregation host is at 88% disk usage and trending upward.',
       'LOW', 'INFRASTRUCTURE', 'OPEN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 4);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000005', 'Suspicious login attempts detected',
       'Repeated failed logins from a single IP range against several accounts. Possible brute force.',
       'HIGH', 'SECURITY', 'IN_PROGRESS', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 5);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000006', 'Checkout latency spike',
       'p99 latency on the checkout endpoint exceeded 2.5s during peak traffic.',
       'MEDIUM', 'APPLICATION', 'RESOLVED', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 6);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000007', 'Failed hardware RAID controller',
       'RAID controller on storage node 3 reported a degraded array. One disk marked failed.',
       'HIGH', 'HARDWARE', 'OPEN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 7);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000008', 'Email delivery delays',
       'Outbound notification emails delayed by up to 30 minutes via the SMTP relay.',
       'LOW', 'INFRASTRUCTURE', 'RESOLVED', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 8);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000009', 'Cache cluster node down',
       'One Redis cache node is unreachable; traffic failed over to replicas with elevated latency.',
       'MEDIUM', 'INFRASTRUCTURE', 'CLOSED', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 9);

INSERT INTO incidents (id, title, description, severity, category, status, created_by, created_at, updated_at, seq)
SELECT '11111111-1111-1111-1111-000000000010', 'TLS certificate expiring soon',
       'The wildcard certificate for the public API expires in 5 days and must be rotated.',
       'CRITICAL', 'SECURITY', 'OPEN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE seq = 10);
