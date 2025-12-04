import { Migration } from "@mikro-orm/migrations";

export class Migration20250224083626 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "rbac_permission_category" ("id" text not null, "name" text not null, "type" text check ("type" in ('predefined', 'custom')) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rbac_permission_category_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_permission_category_deleted_at" ON "rbac_permission_category" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `create table if not exists "rbac_permission" ("id" text not null, "name" text not null, "type" text check ("type" in ('predefined', 'custom')) not null, "matcherType" text check ("matcherType" in ('api')) not null, "matcher" text not null, "actionType" text check ("actionType" in ('read', 'write', 'delete')) not null, "category_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rbac_permission_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_permission_category_id" ON "rbac_permission" (category_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_permission_deleted_at" ON "rbac_permission" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_rbac_permission_matcher" ON "rbac_permission" (COALESCE("matcherType", ''), COALESCE("matcher", ''), COALESCE("actionType", '')) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `create table if not exists "rbac_role" ("id" text not null, "name" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rbac_role_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_role_deleted_at" ON "rbac_role" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `create table if not exists "rbac_policy" ("id" text not null, "type" text check ("type" in ('deny', 'allow')) not null, "permission_id" text not null, "role_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rbac_policy_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_permission_id" ON "rbac_policy" (permission_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_role_id" ON "rbac_policy" (role_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_deleted_at" ON "rbac_policy" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `alter table if exists "rbac_permission" add constraint "rbac_permission_category_id_foreign" foreign key ("category_id") references "rbac_permission_category" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table if exists "rbac_policy" add constraint "rbac_policy_permission_id_foreign" foreign key ("permission_id") references "rbac_permission" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table if exists "rbac_policy" add constraint "rbac_policy_role_id_foreign" foreign key ("role_id") references "rbac_role" ("id") on update cascade on delete cascade;`
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `alter table if exists "rbac_permission" drop constraint if exists "rbac_permission_category_id_foreign";`
    );
    this.addSql(
      `alter table if exists "rbac_policy" drop constraint if exists "rbac_policy_permission_id_foreign";`
    );
    this.addSql(
      `alter table if exists "rbac_policy" drop constraint if exists "rbac_policy_role_id_foreign";`
    );
    this.addSql(
      `DROP INDEX IF EXISTS "UQ_rbac_permission_matcher";`
    );
    this.addSql(`drop table if exists "rbac_permission_category" cascade;`);
    this.addSql(`drop table if exists "rbac_permission" cascade;`);
    this.addSql(`drop table if exists "rbac_role" cascade;`);
    this.addSql(`drop table if exists "rbac_policy" cascade;`);
  }
}
