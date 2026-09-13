-- ============================================================================
-- VERICHAIN RBAC DATABASE SECURITY & RLS MIGRATION
-- Migration Date: 2026-09-14
-- Authoritative Role Model: user, verifier, issuer, govt, admin
-- ============================================================================

-- 1. Ensure profiles table exists with proper schema and defaults
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    passport_number TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Validate permitted role values
DO $$ 
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_valid_role;
    ALTER TABLE public.profiles ADD CONSTRAINT check_valid_role 
        CHECK (role IN ('user', 'verifier', 'issuer', 'govt', 'admin'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Trigger Function: Enforce strict default role = 'user' on signup/insert
CREATE OR REPLACE FUNCTION public.set_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Authenticated self-registration MUST ALWAYS receive role = 'user'
    IF auth.role() = 'authenticated' THEN
        -- Allow role override ONLY IF the executing identity is already an admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            NEW.role := 'user';
        END IF;
    END IF;

    IF NEW.role IS NULL OR NEW.role = '' THEN
        NEW.role := 'user';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_default_user_role ON public.profiles;
CREATE TRIGGER trg_set_default_user_role
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_default_user_role();

-- 4. Trigger Function: Strictly block users from self-elevating or changing roles
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect any attempt to alter profiles.role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- If an authenticated user is attempting the update
        IF auth.role() = 'authenticated' THEN
            -- Check if the current authenticated caller is an admin
            IF NOT EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            ) THEN
                RAISE EXCEPTION '403 Forbidden: You do not have permission to modify roles. Only administrators may assign roles.';
            END IF;
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_unauthorized_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
DROP POLICY IF EXISTS "Profiles are readable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles are readable by owner or admin"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update own details but not escalate role" ON public.profiles;
CREATE POLICY "Users can update own details but not escalate role"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- End of Migration
-- ============================================================================
