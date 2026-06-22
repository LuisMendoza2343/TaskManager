IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Tasks] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(150) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Priority] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Tasks] PRIMARY KEY ([Id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260620080351_InitialCreate', N'9.0.0');

CREATE TABLE [Usuarios] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'PasswordHash', N'Username') AND [object_id] = OBJECT_ID(N'[Usuarios]'))
    SET IDENTITY_INSERT [Usuarios] ON;
INSERT INTO [Usuarios] ([Id], [PasswordHash], [Username])
VALUES (1, N'password123', N'admin');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'PasswordHash', N'Username') AND [object_id] = OBJECT_ID(N'[Usuarios]'))
    SET IDENTITY_INSERT [Usuarios] OFF;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260621072518_AddUsuariosAndSeed', N'9.0.0');

ALTER TABLE [Usuarios] ADD [Role] nvarchar(max) NOT NULL DEFAULT N'';

UPDATE [Usuarios] SET [Role] = N'User'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260622020417_AgregarTablaUsuariosFix', N'9.0.0');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260622023024_InitialCreateFix', N'9.0.0');

UPDATE [Usuarios] SET [PasswordHash] = N'$2a$11$qR.sO66b3N31gV8P1M6pEe9Z6wB5bH9vK5bXmC7vO9wF8yG4uM2mC', [Role] = N'Admin'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260622025958_UpdateAdminPasswordHash', N'9.0.0');

COMMIT;
GO

