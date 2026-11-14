
-- Creates the authentication users table.
-- This migration is safe to execute multiple times.

IF OBJECT_ID(N'dbo.auth_users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.auth_users (
        id INT IDENTITY(1,1) NOT NULL,
        username NVARCHAR(100) NOT NULL,
        display_name NVARCHAR(200) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        is_active BIT NOT NULL
            CONSTRAINT DF_auth_users_is_active DEFAULT (1),
        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_auth_users_created_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_auth_users
            PRIMARY KEY (id),

        CONSTRAINT UQ_auth_users_username
            UNIQUE (username),

        CONSTRAINT CK_auth_users_username_lowercase
            CHECK (username = LOWER(username)),

        CONSTRAINT CK_auth_users_role
            CHECK (role IN ('admin', 'patrouler'))
    );
END;
