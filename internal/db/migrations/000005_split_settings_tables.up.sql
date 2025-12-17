-- 1. App preferences
CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY,
    currency TEXT DEFAULT 'USD',
    language TEXT DEFAULT 'en-US',
    theme TEXT DEFAULT 'light',
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT '2006-01-02',
    module_overrides_json TEXT DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Tax status (user-level, not invoice-level)
CREATE TABLE user_tax_settings (
    user_id INTEGER PRIMARY KEY,
    hst_registered INTEGER DEFAULT 0,
    hst_number TEXT,
    tax_enabled INTEGER DEFAULT 0,
    default_tax_rate REAL DEFAULT 0,
    expected_income TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Invoice templates (sender info + defaults)
CREATE TABLE user_invoice_settings (
    user_id INTEGER PRIMARY KEY,
    sender_name TEXT,
    sender_company TEXT,
    sender_address TEXT,
    sender_phone TEXT,
    sender_email TEXT,
    sender_postal_code TEXT,
    default_terms TEXT DEFAULT 'Due upon receipt',
    default_message_template TEXT DEFAULT 'Thank you for your business.',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate data from settings_json
INSERT INTO user_preferences (user_id, currency, language, theme, timezone, date_format, module_overrides_json)
SELECT id,
    COALESCE(json_extract(settings_json, '$.currency'), 'USD'),
    COALESCE(json_extract(settings_json, '$.language'), 'en-US'),
    COALESCE(json_extract(settings_json, '$.theme'), 'light'),
    COALESCE(json_extract(settings_json, '$.timezone'), 'UTC'),
    COALESCE(json_extract(settings_json, '$.dateFormat'), '2006-01-02'),
    COALESCE(json_extract(settings_json, '$.moduleOverrides'), '{}')
FROM users;

INSERT INTO user_tax_settings (user_id, hst_registered, hst_number, tax_enabled, default_tax_rate, expected_income)
SELECT id,
    COALESCE(json_extract(settings_json, '$.hstRegistered'), 0),
    json_extract(settings_json, '$.hstNumber'),
    COALESCE(json_extract(settings_json, '$.taxEnabled'), 0),
    COALESCE(json_extract(settings_json, '$.defaultTaxRate'), 0),
    json_extract(settings_json, '$.expectedIncome')
FROM users;

INSERT INTO user_invoice_settings (user_id, sender_name, sender_company, sender_address, sender_phone, sender_email, sender_postal_code, default_terms, default_message_template)
SELECT id,
    json_extract(settings_json, '$.senderName'),
    json_extract(settings_json, '$.senderCompany'),
    json_extract(settings_json, '$.senderAddress'),
    json_extract(settings_json, '$.senderPhone'),
    json_extract(settings_json, '$.senderEmail'),
    json_extract(settings_json, '$.senderPostalCode'),
    COALESCE(json_extract(settings_json, '$.invoiceTerms'), 'Due upon receipt'),
    COALESCE(json_extract(settings_json, '$.defaultMessageTemplate'), 'Thank you for your business.')
FROM users;
