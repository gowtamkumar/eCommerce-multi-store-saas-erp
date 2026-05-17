--
-- PostgreSQL database dump
--

\restrict bWKpcWf2yQuAPdjEdqqiqfaJrRdJpzky5nKGvfEKtbQLX0zDVCEueUzArdVNfCQ

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: accounts_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_category_enum AS ENUM (
    'CASH_BANK',
    'RECEIVABLE',
    'INVENTORY',
    'FIXED_ASSET',
    'PAYABLE',
    'EQUITY',
    'SALES',
    'COGS',
    'OPERATING_EXPENSE',
    'OTHER'
);


ALTER TYPE public.accounts_category_enum OWNER TO postgres;

--
-- Name: accounts_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_type_enum AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public.accounts_type_enum OWNER TO postgres;

--
-- Name: applicants_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.applicants_status_enum AS ENUM (
    'APPLIED',
    'SCREENING',
    'INTERVIEW',
    'TECHNICAL',
    'HR_ROUND',
    'OFFER',
    'JOINED',
    'REJECTED'
);


ALTER TYPE public.applicants_status_enum OWNER TO postgres;

--
-- Name: attendance_sessions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.attendance_sessions_status_enum AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALFDAY'
);


ALTER TYPE public.attendance_sessions_status_enum OWNER TO postgres;

--
-- Name: campaign_logs_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaign_logs_status_enum AS ENUM (
    'pending',
    'sent',
    'failed',
    'opened',
    'clicked'
);


ALTER TYPE public.campaign_logs_status_enum OWNER TO postgres;

--
-- Name: campaigns_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaigns_status_enum AS ENUM (
    'draft',
    'scheduled',
    'running',
    'completed',
    'failed'
);


ALTER TYPE public.campaigns_status_enum OWNER TO postgres;

--
-- Name: campaigns_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaigns_type_enum AS ENUM (
    'email',
    'sms',
    'push'
);


ALTER TYPE public.campaigns_type_enum OWNER TO postgres;

--
-- Name: coupons_discounttype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.coupons_discounttype_enum AS ENUM (
    'percentage',
    'fixed',
    'free_shipping'
);


ALTER TYPE public.coupons_discounttype_enum OWNER TO postgres;

--
-- Name: debit_notes_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.debit_notes_status_enum AS ENUM (
    'DRAFT',
    'APPROVED',
    'APPLIED',
    'CANCELLED'
);


ALTER TYPE public.debit_notes_status_enum OWNER TO postgres;

--
-- Name: employees_contracttype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employees_contracttype_enum AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACTUAL',
    'INTERN'
);


ALTER TYPE public.employees_contracttype_enum OWNER TO postgres;

--
-- Name: employees_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employees_status_enum AS ENUM (
    'ACTIVE',
    'PROBATION',
    'ON_LEAVE',
    'TERMINATED',
    'SUSPENDED'
);


ALTER TYPE public.employees_status_enum OWNER TO postgres;

--
-- Name: expenses_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expenses_category_enum AS ENUM (
    'shipping',
    'packaging',
    'marketing',
    'software',
    'salaries',
    'utilities',
    'maintenance',
    'other'
);


ALTER TYPE public.expenses_category_enum OWNER TO postgres;

--
-- Name: faqs_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.faqs_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.faqs_status_enum OWNER TO postgres;

--
-- Name: fulfillment_items_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fulfillment_items_status_enum AS ENUM (
    'PENDING',
    'PICKED'
);


ALTER TYPE public.fulfillment_items_status_enum OWNER TO postgres;

--
-- Name: fulfillment_tasks_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fulfillment_tasks_status_enum AS ENUM (
    'PENDING',
    'PICKING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public.fulfillment_tasks_status_enum OWNER TO postgres;

--
-- Name: goods_received_notes_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.goods_received_notes_status_enum AS ENUM (
    'DRAFT',
    'RECEIVED',
    'REJECTED'
);


ALTER TYPE public.goods_received_notes_status_enum OWNER TO postgres;

--
-- Name: inventory_ledger_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_ledger_reference_type_enum AS ENUM (
    'ORDER',
    'PURCHASE_ORDER',
    'STOCK_ADJUSTMENT',
    'STOCK_TRANSFER',
    'INITIAL_IMPORT',
    'SALES_RETURN',
    'PURCHASE_RETURN',
    'MANUAL',
    'GOODS_RECEIVED_NOTE'
);


ALTER TYPE public.inventory_ledger_reference_type_enum OWNER TO postgres;

--
-- Name: inventory_ledger_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_ledger_type_enum AS ENUM (
    'PURCHASE',
    'SALE',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT',
    'RETURN',
    'DAMAGE',
    'INITIAL_BALANCE',
    'RESERVATION',
    'RESERVATION_CANCEL'
);


ALTER TYPE public.inventory_ledger_type_enum OWNER TO postgres;

--
-- Name: inventory_transactions_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_transactions_reference_type_enum AS ENUM (
    'order',
    'purchase',
    'adjustment',
    'initial',
    'return'
);


ALTER TYPE public.inventory_transactions_reference_type_enum OWNER TO postgres;

--
-- Name: inventory_transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_transactions_type_enum AS ENUM (
    'in',
    'out'
);


ALTER TYPE public.inventory_transactions_type_enum OWNER TO postgres;

--
-- Name: invoices_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invoices_status_enum AS ENUM (
    'pending',
    'paid',
    'overdue',
    'cancelled'
);


ALTER TYPE public.invoices_status_enum OWNER TO postgres;

--
-- Name: job_postings_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_postings_status_enum AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public.job_postings_status_enum OWNER TO postgres;

--
-- Name: journal_entries_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.journal_entries_type_enum AS ENUM (
    'SALES',
    'PURCHASE',
    'CASH_RECEIPT',
    'CASH_PAYMENT',
    'GENERAL',
    'INVENTORY_ADJUSTMENT'
);


ALTER TYPE public.journal_entries_type_enum OWNER TO postgres;

--
-- Name: leads_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leads_status_enum AS ENUM (
    'new',
    'contacted',
    'converted'
);


ALTER TYPE public.leads_status_enum OWNER TO postgres;

--
-- Name: leave_quotas_leavetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_quotas_leavetype_enum AS ENUM (
    'SICK',
    'CASUAL',
    'ANNUAL',
    'MATERNITY',
    'PATERNITY',
    'UNPAID'
);


ALTER TYPE public.leave_quotas_leavetype_enum OWNER TO postgres;

--
-- Name: leave_requests_leavetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_requests_leavetype_enum AS ENUM (
    'SICK',
    'CASUAL',
    'ANNUAL',
    'MATERNITY',
    'PATERNITY',
    'UNPAID'
);


ALTER TYPE public.leave_requests_leavetype_enum OWNER TO postgres;

--
-- Name: leave_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_requests_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.leave_requests_status_enum OWNER TO postgres;

--
-- Name: ledger_entries_side_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ledger_entries_side_enum AS ENUM (
    'DEBIT',
    'CREDIT'
);


ALTER TYPE public.ledger_entries_side_enum OWNER TO postgres;

--
-- Name: order_returns_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_returns_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'refunded'
);


ALTER TYPE public.order_returns_status_enum OWNER TO postgres;

--
-- Name: orders_order_source_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_order_source_enum AS ENUM (
    'website',
    'pos',
    'manual'
);


ALTER TYPE public.orders_order_source_enum OWNER TO postgres;

--
-- Name: orders_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_payment_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'completed'
);


ALTER TYPE public.orders_payment_status_enum OWNER TO postgres;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'completed',
    'cancelled'
);


ALTER TYPE public.orders_status_enum OWNER TO postgres;

--
-- Name: pages_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pages_status_enum AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.pages_status_enum OWNER TO postgres;

--
-- Name: payments_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payments_method_enum AS ENUM (
    'cod',
    'sslcommerz',
    'cash',
    'card',
    'mobile'
);


ALTER TYPE public.payments_method_enum OWNER TO postgres;

--
-- Name: payments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payments_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'completed'
);


ALTER TYPE public.payments_status_enum OWNER TO postgres;

--
-- Name: payroll_batches_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payroll_batches_status_enum AS ENUM (
    'DRAFT',
    'APPROVED',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public.payroll_batches_status_enum OWNER TO postgres;

--
-- Name: pos_registers_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pos_registers_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.pos_registers_status_enum OWNER TO postgres;

--
-- Name: pos_shifts_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pos_shifts_status_enum AS ENUM (
    'OPEN',
    'CLOSED'
);


ALTER TYPE public.pos_shifts_status_enum OWNER TO postgres;

--
-- Name: price_books_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.price_books_type_enum AS ENUM (
    'RETAIL',
    'WHOLESALE',
    'PROMOTIONAL',
    'CUSTOMER_SPECIFIC'
);


ALTER TYPE public.price_books_type_enum OWNER TO postgres;

--
-- Name: products_discount_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.products_discount_type_enum AS ENUM (
    'percentage',
    'fixed',
    'free_shipping'
);


ALTER TYPE public.products_discount_type_enum OWNER TO postgres;

--
-- Name: products_product_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.products_product_type_enum AS ENUM (
    'SIMPLE',
    'VARIABLE',
    'BUNDLE',
    'SERVICE'
);


ALTER TYPE public.products_product_type_enum OWNER TO postgres;

--
-- Name: products_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.products_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.products_status_enum OWNER TO postgres;

--
-- Name: promotions_promotiontype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.promotions_promotiontype_enum AS ENUM (
    'percentage',
    'fixed',
    'free_shipping'
);


ALTER TYPE public.promotions_promotiontype_enum OWNER TO postgres;

--
-- Name: promotions_targettype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.promotions_targettype_enum AS ENUM (
    'entire_order',
    'specific_product',
    'specific_category',
    'specific_brand',
    'minimum_cart_value'
);


ALTER TYPE public.promotions_targettype_enum OWNER TO postgres;

--
-- Name: purchase_orders_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_payment_status_enum AS ENUM (
    'pending',
    'partial',
    'paid'
);


ALTER TYPE public.purchase_orders_payment_status_enum OWNER TO postgres;

--
-- Name: purchase_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_status_enum AS ENUM (
    'draft',
    'pending',
    'received',
    'verified',
    'cancelled'
);


ALTER TYPE public.purchase_orders_status_enum OWNER TO postgres;

--
-- Name: purchase_requisitions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_requisitions_status_enum AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'PO_CREATED'
);


ALTER TYPE public.purchase_requisitions_status_enum OWNER TO postgres;

--
-- Name: quotations_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.quotations_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public.quotations_status_enum OWNER TO postgres;

--
-- Name: reviews_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reviews_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.reviews_status_enum OWNER TO postgres;

--
-- Name: rfqs_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rfqs_status_enum AS ENUM (
    'OPEN',
    'CLOSED',
    'AWARDED',
    'CANCELLED'
);


ALTER TYPE public.rfqs_status_enum OWNER TO postgres;

--
-- Name: shipping_addresses_zone_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shipping_addresses_zone_enum AS ENUM (
    'inside',
    'outside'
);


ALTER TYPE public.shipping_addresses_zone_enum OWNER TO postgres;

--
-- Name: staff_invitations_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_invitations_role_enum AS ENUM (
    'admin',
    'operator',
    'user',
    'super_admin',
    'store_manager',
    'support',
    'marketing',
    'employee'
);


ALTER TYPE public.staff_invitations_role_enum OWNER TO postgres;

--
-- Name: staff_invitations_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_invitations_status_enum AS ENUM (
    'pending',
    'accepted',
    'expired'
);


ALTER TYPE public.staff_invitations_status_enum OWNER TO postgres;

--
-- Name: subscription_invoices_billing_cycle_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_invoices_billing_cycle_enum AS ENUM (
    'monthly',
    'yearly'
);


ALTER TYPE public.subscription_invoices_billing_cycle_enum OWNER TO postgres;

--
-- Name: subscription_invoices_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_invoices_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'completed'
);


ALTER TYPE public.subscription_invoices_status_enum OWNER TO postgres;

--
-- Name: subscription_plans_billing_cycle_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_plans_billing_cycle_enum AS ENUM (
    'monthly',
    'yearly'
);


ALTER TYPE public.subscription_plans_billing_cycle_enum OWNER TO postgres;

--
-- Name: supplier_ap_ledger_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.supplier_ap_ledger_reference_type_enum AS ENUM (
    'PURCHASE_ORDER',
    'GRN',
    'PAYMENT',
    'ADJUSTMENT',
    'OPENING_BALANCE'
);


ALTER TYPE public.supplier_ap_ledger_reference_type_enum OWNER TO postgres;

--
-- Name: suppliers_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.suppliers_category_enum AS ENUM (
    'RAW_MATERIALS',
    'PACKAGING',
    'SERVICES',
    'EQUIPMENT',
    'LOGISTICS',
    'IT_SOFTWARE',
    'OFFICE_SUPPLIES',
    'OTHER'
);


ALTER TYPE public.suppliers_category_enum OWNER TO postgres;

--
-- Name: tenants_custom_domain_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_custom_domain_status_enum AS ENUM (
    'pending',
    'verified',
    'active'
);


ALTER TYPE public.tenants_custom_domain_status_enum OWNER TO postgres;

--
-- Name: tenants_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_status_enum AS ENUM (
    'active',
    'suspended',
    'archived',
    'expired'
);


ALTER TYPE public.tenants_status_enum OWNER TO postgres;

--
-- Name: tenants_subscription_billing_cycle_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_subscription_billing_cycle_enum AS ENUM (
    'monthly',
    'yearly'
);


ALTER TYPE public.tenants_subscription_billing_cycle_enum OWNER TO postgres;

--
-- Name: tenants_subscription_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_subscription_status_enum AS ENUM (
    'trial',
    'active',
    'past_due',
    'canceled',
    'expired'
);


ALTER TYPE public.tenants_subscription_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'operator',
    'user',
    'super_admin',
    'store_manager',
    'support',
    'marketing',
    'employee'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive',
    'blocked'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

--
-- Name: warehouses_location_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.warehouses_location_type_enum AS ENUM (
    'CENTRAL',
    'REGIONAL',
    'TRANSIT',
    'RETAIL'
);


ALTER TYPE public.warehouses_location_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type public.accounts_type_enum NOT NULL,
    category public.accounts_category_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tenant_id uuid NOT NULL,
    description text
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: applicants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applicants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    first_name character varying,
    last_name character varying,
    email character varying NOT NULL,
    phone character varying,
    resume_url text,
    job_posting_id uuid NOT NULL,
    status public.applicants_status_enum DEFAULT 'APPLIED'::public.applicants_status_enum NOT NULL,
    source character varying,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.applicants OWNER TO postgres;

--
-- Name: attendance_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    event_type character varying NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    source character varying,
    device_id character varying,
    ip_address character varying,
    gps_lat numeric(10,7),
    gps_long numeric(10,7),
    photo_url character varying,
    verification_status character varying DEFAULT 'PENDING'::character varying NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.attendance_events OWNER TO postgres;

--
-- Name: attendance_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    clock_in timestamp without time zone NOT NULL,
    clock_out timestamp without time zone,
    work_hours numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    overtime_hours numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    late_minutes integer DEFAULT 0 NOT NULL,
    status public.attendance_sessions_status_enum DEFAULT 'PRESENT'::public.attendance_sessions_status_enum NOT NULL,
    note text
);


ALTER TABLE public.attendance_sessions OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    tenant_id uuid NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity character varying(100) NOT NULL,
    entity_id character varying(255),
    old_value jsonb,
    new_value jsonb,
    ip_address character varying(45),
    user_agent text
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    code character varying NOT NULL,
    address text,
    phone character varying(20),
    email character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    ip_whitelist text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    image character varying,
    website character varying,
    tenant_id uuid NOT NULL,
    user_id uuid,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: campaign_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    campaign_id uuid NOT NULL,
    status public.campaign_logs_status_enum DEFAULT 'pending'::public.campaign_logs_status_enum NOT NULL,
    sent_at timestamp without time zone,
    error text,
    metadata jsonb
);


ALTER TABLE public.campaign_logs OWNER TO postgres;

--
-- Name: campaign_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    campaign_id uuid NOT NULL,
    subject character varying(255),
    html_content text,
    text text,
    title character varying(255),
    body text,
    image_url character varying(500)
);


ALTER TABLE public.campaign_messages OWNER TO postgres;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying(255) NOT NULL,
    type public.campaigns_type_enum DEFAULT 'email'::public.campaigns_type_enum NOT NULL,
    status public.campaigns_status_enum DEFAULT 'draft'::public.campaigns_status_enum NOT NULL,
    schedule_time timestamp without time zone,
    tenant_id uuid NOT NULL,
    total_audience integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    target_users boolean DEFAULT true NOT NULL,
    target_subscribers boolean DEFAULT false NOT NULL,
    target_leads boolean DEFAULT false NOT NULL
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    tenant_id uuid NOT NULL,
    applied_coupon_code character varying(50)
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    image character varying(500),
    tenant_id uuid NOT NULL,
    user_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    parent_id uuid
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    code character varying(50) NOT NULL,
    description character varying(255),
    "discountType" public.coupons_discounttype_enum DEFAULT 'percentage'::public.coupons_discounttype_enum NOT NULL,
    amount numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    start_date timestamp without time zone,
    expiry_date timestamp without time zone,
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: debit_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debit_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    "debitNoteNumber" character varying(50) NOT NULL,
    supplier_id uuid NOT NULL,
    po_id uuid,
    amount numeric(12,2) NOT NULL,
    reason text,
    status public.debit_notes_status_enum DEFAULT 'DRAFT'::public.debit_notes_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    created_by uuid NOT NULL
);


ALTER TABLE public.debit_notes OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    code character varying(50),
    description text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying,
    grade character varying(50),
    "salaryBand" character varying(100),
    description text,
    department_id uuid,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.designations OWNER TO postgres;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    tenant_id uuid NOT NULL,
    token text NOT NULL,
    platform character varying(50) DEFAULT 'web'::character varying NOT NULL,
    user_agent text
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    document_type character varying NOT NULL,
    file_url text NOT NULL,
    expiry_date date,
    verified_by_id uuid,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.employee_documents OWNER TO postgres;

--
-- Name: employee_personal_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_personal_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    dob date,
    gender character varying,
    national_id character varying,
    passport_no character varying,
    emergency_contact jsonb,
    blood_group character varying,
    address text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.employee_personal_details OWNER TO postgres;

--
-- Name: employee_shift_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_shift_assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    shift_id uuid NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.employee_shift_assignments OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id character varying,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    department_id uuid NOT NULL,
    designation_id uuid,
    manager_id uuid,
    status public.employees_status_enum DEFAULT 'PROBATION'::public.employees_status_enum NOT NULL,
    "contractType" public.employees_contracttype_enum DEFAULT 'FULL_TIME'::public.employees_contracttype_enum NOT NULL,
    salary_config jsonb,
    joining_date date NOT NULL,
    exit_date date
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    title character varying(255) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    category public.expenses_category_enum DEFAULT 'other'::public.expenses_category_enum NOT NULL,
    reference_number character varying(100),
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) DEFAULT 'General'::character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status public.faqs_status_enum DEFAULT 'active'::public.faqs_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    product_id uuid,
    page_id uuid,
    user_id uuid
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    fieldname character varying NOT NULL,
    originalname character varying,
    encoding character varying,
    mimetype character varying,
    destination character varying,
    filename character varying,
    pdf_file character varying,
    path character varying,
    size integer,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: fulfillment_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    task_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    bin_id uuid,
    quantity integer NOT NULL,
    picked_quantity integer DEFAULT 0 NOT NULL,
    status public.fulfillment_items_status_enum DEFAULT 'PENDING'::public.fulfillment_items_status_enum NOT NULL
);


ALTER TABLE public.fulfillment_items OWNER TO postgres;

--
-- Name: fulfillment_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    order_id uuid NOT NULL,
    status public.fulfillment_tasks_status_enum DEFAULT 'PENDING'::public.fulfillment_tasks_status_enum NOT NULL,
    warehouse_id uuid,
    assigned_to_user_id uuid,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.fulfillment_tasks OWNER TO postgres;

--
-- Name: goods_received_note_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_received_note_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    grn_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    ordered_qty integer NOT NULL,
    received_qty integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    condition character varying(100),
    tenant_id uuid NOT NULL
);


ALTER TABLE public.goods_received_note_items OWNER TO postgres;

--
-- Name: goods_received_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_received_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    po_id uuid NOT NULL,
    warehouse_id uuid NOT NULL,
    status public.goods_received_notes_status_enum DEFAULT 'DRAFT'::public.goods_received_notes_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    received_by_user_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    notes text,
    "grnNumber" character varying(50) NOT NULL,
    "receivedDate" timestamp without time zone NOT NULL
);


ALTER TABLE public.goods_received_notes OWNER TO postgres;

--
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    applicant_id uuid NOT NULL,
    interviewer_id uuid NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    feedback text,
    score integer,
    status character varying DEFAULT 'SCHEDULED'::character varying NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- Name: inventory_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_ledger (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    product_id uuid NOT NULL,
    variant_id uuid,
    branch_id uuid,
    warehouse_id uuid,
    bin_id uuid,
    supplier_id uuid,
    type public.inventory_ledger_type_enum NOT NULL,
    quantity numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    balance_after numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    remaining_quantity numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    unit_cost numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    cogs_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    reference_type public.inventory_ledger_reference_type_enum NOT NULL,
    reference_id character varying(255),
    tenant_id uuid NOT NULL,
    remarks text
);


ALTER TABLE public.inventory_ledger OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    invoice_number character varying(100) NOT NULL,
    order_id uuid NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    status public.invoices_status_enum DEFAULT 'pending'::public.invoices_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_postings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    title character varying NOT NULL,
    description text NOT NULL,
    requirements json,
    department_id uuid NOT NULL,
    location character varying,
    salary_range_min numeric(12,2),
    salary_range_max numeric(12,2),
    status public.job_postings_status_enum DEFAULT 'DRAFT'::public.job_postings_status_enum NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.job_postings OWNER TO postgres;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    date timestamp with time zone DEFAULT now() NOT NULL,
    type public.journal_entries_type_enum NOT NULL,
    description character varying(255) NOT NULL,
    "referenceType" character varying(100),
    "referenceId" character varying(255),
    tenant_id uuid NOT NULL,
    "totalAmount" numeric(15,2) NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(50),
    address text,
    subject character varying(255),
    message text,
    status public.leads_status_enum DEFAULT 'new'::public.leads_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: leave_quotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_quotas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    "leaveType" public.leave_quotas_leavetype_enum NOT NULL,
    "totalDays" integer DEFAULT 0 NOT NULL,
    "usedDays" integer DEFAULT 0 NOT NULL,
    year integer NOT NULL
);


ALTER TABLE public.leave_quotas OWNER TO postgres;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    "leaveType" public.leave_requests_leavetype_enum NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text NOT NULL,
    status public.leave_requests_status_enum DEFAULT 'PENDING'::public.leave_requests_status_enum NOT NULL,
    approved_by_id uuid,
    manager_note text
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    journal_entry_id uuid NOT NULL,
    account_id uuid NOT NULL,
    side public.ledger_entries_side_enum NOT NULL,
    amount numeric(15,2) NOT NULL,
    "balanceAfter" numeric(15,2) NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.ledger_entries OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    snapshot jsonb,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_returns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    order_id uuid NOT NULL,
    user_id uuid,
    status public.order_returns_status_enum DEFAULT 'pending'::public.order_returns_status_enum NOT NULL,
    reason text NOT NULL,
    admin_comment text,
    refund_amount numeric(10,2),
    items jsonb NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.order_returns OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(50) NOT NULL,
    address text NOT NULL,
    shipping_address_id uuid,
    total_amount numeric(10,2) NOT NULL,
    shipping_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(10) DEFAULT 'BDT'::character varying NOT NULL,
    currency_rate numeric(10,4) DEFAULT '1'::numeric NOT NULL,
    status public.orders_status_enum DEFAULT 'pending'::public.orders_status_enum NOT NULL,
    payment_status public.orders_payment_status_enum DEFAULT 'pending'::public.orders_payment_status_enum NOT NULL,
    transaction_id character varying(255),
    order_notes text,
    user_id uuid,
    tenant_id uuid NOT NULL,
    tracking_id character varying(255),
    courier_status character varying(255),
    applied_coupon character varying(50),
    coupon_discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    delivery_zone character varying(50),
    order_source public.orders_order_source_enum DEFAULT 'website'::public.orders_order_source_enum NOT NULL,
    payment_method character varying(50)
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    title character varying(255) NOT NULL,
    slug character varying(255) DEFAULT ''::character varying NOT NULL,
    is_home_page boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    sections jsonb,
    meta_title character varying(255),
    meta_description text,
    og_image character varying(500),
    typography jsonb,
    status public.pages_status_enum DEFAULT 'published'::public.pages_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    order_id uuid NOT NULL,
    user_id uuid,
    transaction_id character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'BDT'::character varying NOT NULL,
    method public.payments_method_enum NOT NULL,
    status public.payments_status_enum DEFAULT 'pending'::public.payments_status_enum NOT NULL,
    gateway_response jsonb,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payroll_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_batches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    period character varying NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status public.payroll_batches_status_enum DEFAULT 'DRAFT'::public.payroll_batches_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    journal_entry_id uuid
);


ALTER TABLE public.payroll_batches OWNER TO postgres;

--
-- Name: payroll_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_slips (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    batch_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    total_allowances numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_deductions numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    net_salary numeric(12,2) NOT NULL,
    details jsonb NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.payroll_slips OWNER TO postgres;

--
-- Name: performance_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    employee_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    review_period character varying NOT NULL,
    score numeric(4,2) NOT NULL,
    comments text,
    kpi_metrics jsonb,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.performance_reviews OWNER TO postgres;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    brand_name character varying,
    brand_logo character varying,
    support_email character varying,
    hero jsonb,
    features jsonb,
    footer jsonb,
    user_id uuid
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: pos_registers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_registers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying(100) NOT NULL,
    branch_id uuid NOT NULL,
    status public.pos_registers_status_enum DEFAULT 'ACTIVE'::public.pos_registers_status_enum NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.pos_registers OWNER TO postgres;

--
-- Name: pos_shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_shifts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    register_id uuid NOT NULL,
    status public.pos_shifts_status_enum DEFAULT 'OPEN'::public.pos_shifts_status_enum NOT NULL,
    opening_time timestamp with time zone DEFAULT now() NOT NULL,
    closing_time timestamp with time zone,
    opening_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    closing_balance numeric(12,2),
    cash_sales numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    card_sales numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    mobile_sales numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    expected_closing_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    difference numeric(12,2),
    tenant_id uuid NOT NULL,
    remarks text
);


ALTER TABLE public.pos_shifts OWNER TO postgres;

--
-- Name: price_books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_books (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    code character varying NOT NULL,
    type public.price_books_type_enum DEFAULT 'RETAIL'::public.price_books_type_enum NOT NULL,
    currency character varying(10) DEFAULT 'BDT'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    valid_from timestamp with time zone,
    valid_to timestamp with time zone,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.price_books OWNER TO postgres;

--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(100) NOT NULL,
    "values" text NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_prices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    price_book_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    price numeric(12,2) NOT NULL,
    min_quantity integer DEFAULT 1 NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.product_prices OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku character varying(255) NOT NULL,
    price numeric(10,2),
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    images text,
    combination jsonb NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    is_default boolean DEFAULT false NOT NULL,
    average_cost numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    wholesale_price numeric(10,2),
    barcode character varying(100)
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text NOT NULL,
    short_description text,
    price numeric(10,2) NOT NULL,
    is_review boolean DEFAULT true NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_type public.products_discount_type_enum DEFAULT 'percentage'::public.products_discount_type_enum,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    images text NOT NULL,
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    status public.products_status_enum DEFAULT 'inactive'::public.products_status_enum NOT NULL,
    category_id uuid,
    brand_id uuid,
    landing_page_id uuid,
    faq_source character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    faq_ids text,
    supplier_id uuid,
    tenant_id uuid NOT NULL,
    user_id uuid,
    meta_title character varying(255),
    meta_description text,
    og_image character varying(500),
    is_new boolean DEFAULT false NOT NULL,
    is_hot boolean DEFAULT false NOT NULL,
    is_sale boolean DEFAULT false NOT NULL,
    average_cost numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    wholesale_price numeric(10,2) DEFAULT '0'::numeric,
    min_wholesale_qty integer DEFAULT 1,
    sku character varying(100),
    barcode character varying(100),
    product_type public.products_product_type_enum DEFAULT 'SIMPLE'::public.products_product_type_enum NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(255) NOT NULL,
    slug character varying NOT NULL,
    description text,
    "promotionType" public.promotions_promotiontype_enum DEFAULT 'percentage'::public.promotions_promotiontype_enum NOT NULL,
    value numeric(10,2),
    "targetType" public.promotions_targettype_enum DEFAULT 'entire_order'::public.promotions_targettype_enum NOT NULL,
    target_id uuid,
    min_order_value numeric(10,2),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    purchase_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    user_id uuid
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    supplier_id uuid NOT NULL,
    status public.purchase_orders_status_enum DEFAULT 'draft'::public.purchase_orders_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    reference_number character varying(255) NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_status public.purchase_orders_payment_status_enum DEFAULT 'pending'::public.purchase_orders_payment_status_enum NOT NULL,
    paid_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    pr_id uuid,
    delivery_date date
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_requisition_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requisition_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    pr_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    notes character varying(255),
    tenant_id uuid NOT NULL
);


ALTER TABLE public.purchase_requisition_items OWNER TO postgres;

--
-- Name: purchase_requisitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requisitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    "prNumber" character varying(50) NOT NULL,
    status public.purchase_requisitions_status_enum DEFAULT 'DRAFT'::public.purchase_requisitions_status_enum NOT NULL,
    justification text,
    required_date date NOT NULL,
    tenant_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    branch_id uuid,
    warehouse_id uuid
);


ALTER TABLE public.purchase_requisitions OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    rfq_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    lead_time_days integer DEFAULT 0 NOT NULL,
    status public.quotations_status_enum DEFAULT 'PENDING'::public.quotations_status_enum NOT NULL,
    "termsAndConditions" text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_id uuid NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    comment text NOT NULL,
    status public.reviews_status_enum DEFAULT 'pending'::public.reviews_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: rfqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfqs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    "rfqNumber" character varying(50) NOT NULL,
    status public.rfqs_status_enum DEFAULT 'OPEN'::public.rfqs_status_enum NOT NULL,
    deadline_date date NOT NULL,
    pr_id uuid,
    tenant_id uuid NOT NULL,
    created_by uuid NOT NULL
);


ALTER TABLE public.rfqs OWNER TO postgres;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    grace_minutes integer DEFAULT 15 NOT NULL,
    is_night_shift boolean DEFAULT false NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    tenant_id uuid NOT NULL,
    label character varying(100),
    recipient_name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    address text NOT NULL,
    city character varying(100),
    zone public.shipping_addresses_zone_enum,
    is_default boolean DEFAULT false NOT NULL
);


ALTER TABLE public.shipping_addresses OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    logo character varying,
    brand_name character varying,
    site_description character varying,
    contact_email character varying,
    contact_phone character varying,
    whatsapp_phone character varying,
    address character varying,
    currency character varying,
    currency_symbol character varying,
    supported_currencies jsonb,
    social_links jsonb,
    marketing jsonb,
    smtp jsonb,
    payment jsonb,
    pathao_courier jsonb,
    steadfast_courier jsonb,
    shipping_config jsonb,
    navbar jsonb,
    footer jsonb,
    trust_badges jsonb,
    products_page jsonb,
    single_product_page jsonb,
    offers_page jsonb,
    robots_txt text,
    tenant_id uuid NOT NULL,
    user_id uuid,
    sms jsonb
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: staff_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_invitations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    email character varying NOT NULL,
    role public.staff_invitations_role_enum DEFAULT 'operator'::public.staff_invitations_role_enum NOT NULL,
    tenant_id uuid NOT NULL,
    token character varying NOT NULL,
    status public.staff_invitations_status_enum DEFAULT 'pending'::public.staff_invitations_status_enum NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    invited_by uuid,
    user_id uuid,
    branch_id uuid,
    warehouse_id uuid
);


ALTER TABLE public.staff_invitations OWNER TO postgres;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    email character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    user_id uuid,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- Name: subscription_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    invoice_number character varying(100) NOT NULL,
    tenant_id uuid NOT NULL,
    subscription_plan_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    status public.subscription_invoices_status_enum DEFAULT 'pending'::public.subscription_invoices_status_enum NOT NULL,
    transaction_id character varying,
    billing_date timestamp with time zone DEFAULT now() NOT NULL,
    payment_url text,
    gateway_response jsonb,
    billing_cycle public.subscription_invoices_billing_cycle_enum DEFAULT 'monthly'::public.subscription_invoices_billing_cycle_enum NOT NULL,
    user_id uuid
);


ALTER TABLE public.subscription_invoices OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    billing_cycle public.subscription_plans_billing_cycle_enum DEFAULT 'monthly'::public.subscription_plans_billing_cycle_enum NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    user_id uuid,
    monthly_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    yearly_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    is_popular boolean DEFAULT false NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: supplier_ap_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_ap_ledger (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    supplier_id uuid NOT NULL,
    reference_type public.supplier_ap_ledger_reference_type_enum NOT NULL,
    reference_id uuid,
    debit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    credit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    balance_after numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    remarks text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.supplier_ap_ledger OWNER TO postgres;

--
-- Name: supplier_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    title character varying(255) NOT NULL,
    "fileUrl" character varying(500) NOT NULL,
    "documentType" character varying(50),
    supplier_id uuid NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.supplier_documents OWNER TO postgres;

--
-- Name: supplier_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    purchase_order_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone DEFAULT now() NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(255),
    note text,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.supplier_payments OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    address text,
    tenant_id uuid NOT NULL,
    user_id uuid,
    code character varying,
    "contactPerson" character varying,
    "taxId" character varying,
    "openingBalance" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "currentBalance" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status character varying DEFAULT 'ACTIVE'::character varying NOT NULL,
    performance jsonb,
    name character varying NOT NULL,
    email character varying,
    phone character varying,
    contact_name character varying(255),
    rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    lead_time_days integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    category public.suppliers_category_enum DEFAULT 'OTHER'::public.suppliers_category_enum NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: tenant_traffic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_traffic (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    tenant_id uuid NOT NULL,
    date date NOT NULL,
    request_count integer DEFAULT 0 NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.tenant_traffic OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    store_name character varying NOT NULL,
    subdomain character varying NOT NULL,
    custom_domain character varying,
    custom_domain_status public.tenants_custom_domain_status_enum DEFAULT 'pending'::public.tenants_custom_domain_status_enum NOT NULL,
    custom_domain_verified_at timestamp with time zone,
    status public.tenants_status_enum DEFAULT 'active'::public.tenants_status_enum NOT NULL,
    ssl_enabled boolean DEFAULT false NOT NULL,
    subscription_plan_id uuid,
    subscription_billing_cycle public.tenants_subscription_billing_cycle_enum DEFAULT 'monthly'::public.tenants_subscription_billing_cycle_enum NOT NULL,
    subscription_status public.tenants_subscription_status_enum DEFAULT 'active'::public.tenants_subscription_status_enum NOT NULL,
    subscription_starts_at timestamp with time zone,
    subscription_ends_at timestamp with time zone,
    user_id uuid
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    email character varying,
    username character varying NOT NULL,
    password character varying NOT NULL,
    phone character varying,
    address text,
    image character varying,
    is_admin boolean DEFAULT false NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    email_verification_token character varying,
    reset_password_token character varying,
    reset_password_expires timestamp with time zone,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL,
    refresh_token character varying,
    tenant_id uuid,
    push_token character varying,
    fcm_token character varying,
    branch_id uuid,
    warehouse_id uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: warehouse_bins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_bins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    warehouse_id uuid NOT NULL,
    zone character varying NOT NULL,
    bin_code character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.warehouse_bins OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    name character varying NOT NULL,
    code character varying NOT NULL,
    location_type public.warehouses_location_type_enum DEFAULT 'CENTRAL'::public.warehouses_location_type_enum NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    ip_whitelist text,
    tenant_id uuid NOT NULL,
    branch_id uuid
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, created_at, updated_at, deleted_at, user_id, code, name, type, category, "isActive", "isSystem", balance, tenant_id, description) FROM stdin;
be6e02ad-5b6f-49cc-be91-f3bc6d514e93	2026-05-17 09:16:13.2164+00	2026-05-17 09:16:13.2164+00	\N	\N	1200	Accounts Receivable	ASSET	RECEIVABLE	t	t	0.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
ea4e81aa-8bad-4439-adb2-2b307d224494	2026-05-17 09:16:13.2164+00	2026-05-17 09:16:13.2164+00	\N	\N	2100	Accounts Payable	LIABILITY	PAYABLE	t	t	0.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
31bfaa3a-7ccc-4917-b721-941470b7192c	2026-05-17 09:16:13.2164+00	2026-05-17 09:16:13.2164+00	\N	\N	3000	Retained Earnings	EQUITY	EQUITY	t	t	0.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
132bf2e8-b851-4780-aebf-2104888b82a9	2026-05-17 09:16:13.2164+00	2026-05-17 09:16:13.2164+00	\N	\N	6000	Operating Expenses	EXPENSE	OPERATING_EXPENSE	t	f	0.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
401a6936-8d5c-4239-a13d-0b7df0849095	2026-05-17 09:16:13.2164+00	2026-05-17 09:46:33.866229+00	\N	\N	5000	Cost of Goods Sold	EXPENSE	COGS	t	t	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
cf5d7571-b0db-43cd-983d-96c9b2c653be	2026-05-17 09:16:13.2164+00	2026-05-17 09:46:33.866229+00	\N	\N	1100	Inventory	ASSET	INVENTORY	t	t	-136.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
96f386ff-c712-4ac5-969d-ce502d27e39b	2026-05-17 09:16:13.2164+00	2026-05-17 09:46:33.866229+00	\N	\N	1000	Cash	ASSET	CASH_BANK	t	t	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
abd44cfa-9147-45dc-8454-2c8a9a53ffed	2026-05-17 09:16:13.2164+00	2026-05-17 09:46:33.866229+00	\N	\N	4000	Sales Revenue	REVENUE	SALES	t	t	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: applicants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applicants (id, created_at, updated_at, deleted_at, user_id, first_name, last_name, email, phone, resume_url, job_posting_id, status, source, tenant_id) FROM stdin;
\.


--
-- Data for Name: attendance_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_events (id, created_at, updated_at, deleted_at, user_id, employee_id, event_type, "timestamp", source, device_id, ip_address, gps_lat, gps_long, photo_url, verification_status, tenant_id) FROM stdin;
\.


--
-- Data for Name: attendance_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_sessions (id, created_at, updated_at, deleted_at, user_id, employee_id, tenant_id, branch_id, clock_in, clock_out, work_hours, overtime_hours, late_minutes, status, note) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, created_at, updated_at, deleted_at, tenant_id, user_id, action, entity, entity_id, old_value, new_value, ip_address, user_agent) FROM stdin;
8b38b512-7fdc-499e-804e-de6a86d61c87	2026-04-01 12:27:42.804833+00	2026-04-01 12:27:42.804833+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	CREATE	Brand	\N	\N	{"name": "Nike Brand", "slug": "nike-brand", "image": "", "website": "https://www.nike.com/", "description": ""}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
962b0289-f458-4ab3-9aad-b245957818ba	2026-04-06 13:39:01.836229+00	2026-04-06 13:39:01.836229+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	CREATE	Brand	\N	\N	{"name": "Suzuki", "slug": "suzuki"}	::ffff:172.18.0.1	PostmanRuntime/7.49.1
b5da63b9-c2ae-4f97-8791-b35bbff20a33	2026-04-06 13:42:09.839917+00	2026-04-06 13:42:09.839917+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	DELETE	Brand	f6fd88a3-a489-4918-8034-78a2837dd4fc	\N	\N	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
b4c8b368-8955-420b-8c49-045387f409a7	2026-04-06 13:45:54.053117+00	2026-04-06 13:45:54.053117+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	CREATE	Brand	\N	\N	{"name": "Apple", "slug": "apple"}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
f9126aff-ec34-4ddf-98a9-094bb2f7c4dd	2026-04-06 13:46:08.048739+00	2026-04-06 13:46:08.048739+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	UPDATE	Brand	f66c4c95-b32f-4a59-92b4-52ed7b61cebc	\N	{"name": "Nike", "slug": "nike-brand", "image": "", "website": "https://www.nike.com/", "description": ""}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
0d2d0b46-6115-4fdb-bbb2-1ad72ed05f4b	2026-04-06 13:46:23.819133+00	2026-04-06 13:46:23.819133+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	DELETE	Brand	4a3d598a-36f4-479c-a5bd-4f1e19e5fca7	\N	\N	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
1a346b7b-c366-4ef5-bdee-f0ebd9a01249	2026-04-06 13:49:53.252136+00	2026-04-06 13:49:53.252136+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	UPDATE	Brand	f66c4c95-b32f-4a59-92b4-52ed7b61cebc	\N	{"name": "Nike", "slug": "nike-brand", "image": "http://localhost:3900/uploads/1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp", "website": "https://www.nike.com/", "description": ""}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
c4dfa316-fcb3-4049-a69f-d60351b506ad	2026-04-06 13:50:00.716487+00	2026-04-06 13:50:00.716487+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	UPDATE	Brand	f66c4c95-b32f-4a59-92b4-52ed7b61cebc	\N	{"name": "Nike", "slug": "nike-brand", "image": "http://localhost:3900/uploads/1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp", "website": "https://www.nike.com/", "description": "asdfasdfasdf"}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
7b4a4962-4f47-4665-9c8d-14713fcd0dbc	2026-05-17 04:21:59.121664+00	2026-05-17 04:21:59.121664+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	CREATE	Supplier	c49e0517-3518-4631-b388-51ed381db6e2	\N	{"id": "c49e0517-3518-4631-b388-51ed381db6e2", "code": "Totam qui voluptate ", "name": "Voluptatem ipsa fu", "email": "vateje@mailinator.com", "phone": "", "taxId": "", "status": "ACTIVE", "userId": null, "address": "Veritatis ab cumque ", "category": "Electronics", "tenantId": "7f8b8b58-8659-4638-af2e-587bb9e82835", "createdAt": "2026-05-17T04:21:59.101Z", "deletedAt": null, "updatedAt": "2026-05-17T04:21:59.101Z", "performance": null, "contactPerson": "", "currentBalance": "0.00", "openingBalance": "0.00"}	\N	\N
47e0edca-7c8b-44a0-99b5-e5c0e7d90a1c	2026-05-17 08:40:28.412625+00	2026-05-17 08:40:28.412625+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	CREATE	Employee	bfa97e35-42a1-4f80-8678-dd555c5f374e	\N	{"id": "bfa97e35-42a1-4f80-8678-dd555c5f374e", "status": "ACTIVE", "userId": "1a43be4e-51ab-4143-bc2c-092274f0742f", "branchId": "d8b8b58a-8659-4638-af2e-587bb9e82835", "exitDate": null, "tenantId": "7f8b8b58-8659-4638-af2e-587bb9e82835", "createdAt": "2026-05-17T08:40:28.382Z", "deletedAt": null, "managerId": null, "updatedAt": "2026-05-17T08:40:28.382Z", "employeeId": null, "joiningDate": "2026-05-17T00:00:00.000Z", "contractType": "FULL_TIME", "departmentId": "5bd70e79-fbc3-4441-90c5-2bbea68e7e81", "salaryConfig": {"allowances": [], "deductions": [], "basicSalary": 15000}, "designationId": "f034cc98-0b47-4715-ad58-0e027a02dc72"}	\N	\N
6408e761-8811-47c8-b738-54e976b652b2	2026-05-17 08:40:42.304341+00	2026-05-17 08:40:42.304341+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	ASSIGN	EmployeeShift	1f76b766-ecae-4b15-afc4-83625350d613	\N	{"id": "1f76b766-ecae-4b15-afc4-83625350d613", "userId": null, "shiftId": "fe50de8d-604e-49ae-8f53-b23e3be06892", "tenantId": "7f8b8b58-8659-4638-af2e-587bb9e82835", "createdAt": "2026-05-17T08:40:42.294Z", "deletedAt": null, "updatedAt": "2026-05-17T08:40:42.294Z", "employeeId": "bfa97e35-42a1-4f80-8678-dd555c5f374e", "effectiveTo": null, "effectiveFrom": "2026-05-17T00:00:00.000Z"}	\N	\N
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, created_at, updated_at, deleted_at, user_id, name, code, address, phone, email, is_active, ip_whitelist, tenant_id) FROM stdin;
d8b8b58a-8659-4638-af2e-587bb9e82835	2026-05-17 04:43:54.693108+00	2026-05-17 04:43:54.693108+00	\N	\N	Main Branch	MAIN-BR	\N	\N	\N	t	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, created_at, updated_at, deleted_at, name, slug, description, image, website, tenant_id, user_id, is_active) FROM stdin;
f6fd88a3-a489-4918-8034-78a2837dd4fc	2026-04-06 13:39:01.823229+00	2026-04-06 13:42:09.833788+00	2026-04-06 13:42:09.833788+00	Suzuki	suzuki	\N	\N	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	t
4a3d598a-36f4-479c-a5bd-4f1e19e5fca7	2026-04-06 13:45:54.044543+00	2026-04-06 13:46:23.815321+00	2026-04-06 13:46:23.815321+00	Apple	apple	\N	\N	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	t
f66c4c95-b32f-4a59-92b4-52ed7b61cebc	2026-04-01 12:27:42.797794+00	2026-04-06 13:50:00.707463+00	\N	Nike	nike-brand	asdfasdfasdf	http://localhost:3900/uploads/1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp	https://www.nike.com/	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	t
\.


--
-- Data for Name: campaign_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_logs (id, created_at, updated_at, deleted_at, user_id, campaign_id, status, sent_at, error, metadata) FROM stdin;
bc7e016c-e390-431b-9678-a870babab1d7	2026-04-20 09:32:00.155211+00	2026-04-20 09:32:03.172828+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	26f67724-878d-440a-9cba-fde99f5fd1ce	sent	2026-04-20 09:32:03.168	\N	\N
3479f8d8-5d43-4370-bcd4-6f8c9192a13c	2026-04-20 09:32:03.195345+00	2026-04-20 09:32:06.063592+00	\N	\N	26f67724-878d-440a-9cba-fde99f5fd1ce	sent	2026-04-20 09:32:06.06	\N	\N
1fbaa7d9-7a09-42fc-a72b-6d1896eccd29	2026-04-20 09:32:06.082347+00	2026-04-20 09:32:08.813738+00	\N	\N	26f67724-878d-440a-9cba-fde99f5fd1ce	sent	2026-04-20 09:32:08.81	\N	\N
af928759-23cb-428c-9d3f-5d8065dec513	2026-04-20 09:32:08.831998+00	2026-04-20 09:32:11.635065+00	\N	\N	26f67724-878d-440a-9cba-fde99f5fd1ce	sent	2026-04-20 09:32:11.632	\N	\N
70bee370-4d16-4318-ac23-a0c1ddee1a95	2026-04-20 10:57:00.133408+00	2026-04-20 10:57:03.426917+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	a22e4c84-2be6-425d-98c6-05c2e3f23c38	sent	2026-04-20 10:57:03.418	\N	{"name": "gowtam", "email": "gowtam@gmail.com", "phone": "01767163545"}
11cdd03a-8fb3-4098-8550-1f327b63954a	2026-04-20 10:57:03.444047+00	2026-04-20 10:57:06.523189+00	\N	\N	a22e4c84-2be6-425d-98c6-05c2e3f23c38	sent	2026-04-20 10:57:06.517	\N	{"email": "demo@gmail.com"}
53c13bc4-fe2d-4280-bfda-f00104959256	2026-04-20 10:57:06.538288+00	2026-04-20 10:57:09.348771+00	\N	\N	a22e4c84-2be6-425d-98c6-05c2e3f23c38	sent	2026-04-20 10:57:09.342	\N	{"email": "gowtampaul0@gmail.com"}
0a5393ba-2a61-4a45-8fd6-ff522ae8e949	2026-04-20 10:57:09.362217+00	2026-04-20 10:57:12.011645+00	\N	\N	a22e4c84-2be6-425d-98c6-05c2e3f23c38	sent	2026-04-20 10:57:12.004	\N	{"email": "gowtamk217@gmail.com"}
\.


--
-- Data for Name: campaign_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_messages (id, created_at, updated_at, deleted_at, user_id, campaign_id, subject, html_content, text, title, body, image_url) FROM stdin;
474238df-d31e-43b9-81da-b05a7cb50cba	2026-04-20 09:29:49.846828+00	2026-04-20 09:29:49.846828+00	\N	\N	26f67724-878d-440a-9cba-fde99f5fd1ce	subject	<p>dddddddddd</p>				
5e233539-22e0-44a2-883b-b7af271b8b21	2026-04-20 10:51:53.721947+00	2026-04-20 10:51:53.721947+00	\N	\N	a22e4c84-2be6-425d-98c6-05c2e3f23c38	second 2	<p>test secend</p>				
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, created_at, updated_at, deleted_at, user_id, name, type, status, schedule_time, tenant_id, total_audience, sent_count, failed_count, target_users, target_subscribers, target_leads) FROM stdin;
26f67724-878d-440a-9cba-fde99f5fd1ce	2026-04-20 09:29:49.831851+00	2026-04-20 09:32:11.647279+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	name 	email	completed	2026-04-20 09:32:00	7f8b8b58-8659-4638-af2e-587bb9e82835	4	4	0	t	t	f
a22e4c84-2be6-425d-98c6-05c2e3f23c38	2026-04-20 10:51:53.70599+00	2026-04-20 10:57:12.021347+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	secend	email	completed	2026-04-20 10:57:00	7f8b8b58-8659-4638-af2e-587bb9e82835	4	4	0	t	t	t
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, created_at, updated_at, deleted_at, cart_id, product_id, variant_id, quantity, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, created_at, updated_at, deleted_at, user_id, tenant_id, applied_coupon_code) FROM stdin;
62f7dd21-d16d-45b2-bcc4-eb9150603a88	2026-03-30 14:27:58.997852+00	2026-03-30 14:27:58.997852+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, created_at, updated_at, deleted_at, name, slug, description, image, tenant_id, user_id, is_active, sort_order, parent_id) FROM stdin;
4ecb71c4-e0ba-4f61-813b-42f3d7baaa4e	2026-04-01 12:27:20.792817+00	2026-04-06 13:49:24.610152+00	\N	Nike	nike	eeeeeeeeeee	http://localhost:3900/uploads/1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	t	0	\N
08e707e1-ecbe-4c34-840a-80306b6e432b	2026-04-06 13:46:50.595524+00	2026-04-08 10:52:07.086924+00	\N	Cabble	cabble	asdfaasdfasdf	http://localhost:3900/uploads/1775048339713_63e1a453b53d5907ab06adb3aeeba854.webp	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	t	0	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, created_at, updated_at, deleted_at, code, description, "discountType", amount, min_purchase_amount, start_date, expiry_date, usage_limit, used_count, is_active, tenant_id, user_id) FROM stdin;
4f2e46fa-c3ac-433d-b795-26dece90ca1a	2026-04-18 11:29:24.800682+00	2026-04-18 11:29:24.800682+00	\N	SUMMER	20% discount	fixed	100.00	1000.00	2026-04-17 00:00:00	2026-04-30 00:00:00	10	0	t	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: debit_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debit_notes (id, created_at, updated_at, deleted_at, user_id, "debitNoteNumber", supplier_id, po_id, amount, reason, status, tenant_id, created_by) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, created_at, updated_at, deleted_at, user_id, name, code, description, tenant_id) FROM stdin;
3d060283-ca32-4406-b9df-893f9855f3f0	2026-05-17 08:37:48.705294+00	2026-05-17 08:37:48.705294+00	\N	\N	IT & Engineering	\N	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
5bd70e79-fbc3-4441-90c5-2bbea68e7e81	2026-05-17 08:37:48.723629+00	2026-05-17 08:37:48.723629+00	\N	\N	Sales & Marketing	\N	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designations (id, created_at, updated_at, deleted_at, user_id, name, grade, "salaryBand", description, department_id, tenant_id) FROM stdin;
3f034473-a1eb-4990-a4cc-5425a3f6568e	2026-05-17 08:37:48.730031+00	2026-05-17 08:37:48.730031+00	\N	\N	Senior Developer	\N	\N	\N	3d060283-ca32-4406-b9df-893f9855f3f0	7f8b8b58-8659-4638-af2e-587bb9e82835
f034cc98-0b47-4715-ad58-0e027a02dc72	2026-05-17 08:37:48.738244+00	2026-05-17 08:37:48.738244+00	\N	\N	Sales Manager	\N	\N	\N	5bd70e79-fbc3-4441-90c5-2bbea68e7e81	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, created_at, updated_at, deleted_at, user_id, tenant_id, token, platform, user_agent) FROM stdin;
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_documents (id, created_at, updated_at, deleted_at, user_id, employee_id, document_type, file_url, expiry_date, verified_by_id, tenant_id) FROM stdin;
\.


--
-- Data for Name: employee_personal_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_personal_details (id, created_at, updated_at, deleted_at, user_id, employee_id, dob, gender, national_id, passport_no, emergency_contact, blood_group, address, tenant_id) FROM stdin;
4d78f444-9e6b-49a1-920f-9014a676b8ec	2026-05-17 08:40:28.404323+00	2026-05-17 08:40:28.404323+00	\N	\N	bfa97e35-42a1-4f80-8678-dd555c5f374e	2008-02-17	MALE	3465456456	\N	\N	A+	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: employee_shift_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_shift_assignments (id, created_at, updated_at, deleted_at, user_id, employee_id, shift_id, effective_from, effective_to, tenant_id) FROM stdin;
1f76b766-ecae-4b15-afc4-83625350d613	2026-05-17 08:40:42.294841+00	2026-05-17 08:40:42.294841+00	\N	\N	bfa97e35-42a1-4f80-8678-dd555c5f374e	fe50de8d-604e-49ae-8f53-b23e3be06892	2026-05-17	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, created_at, updated_at, deleted_at, user_id, employee_id, tenant_id, branch_id, department_id, designation_id, manager_id, status, "contractType", salary_config, joining_date, exit_date) FROM stdin;
bfa97e35-42a1-4f80-8678-dd555c5f374e	2026-05-17 08:40:28.382821+00	2026-05-17 08:40:28.382821+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	d8b8b58a-8659-4638-af2e-587bb9e82835	5bd70e79-fbc3-4441-90c5-2bbea68e7e81	f034cc98-0b47-4715-ad58-0e027a02dc72	\N	ACTIVE	FULL_TIME	{"allowances": [], "deductions": [], "basicSalary": 15000}	2026-05-17	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, created_at, updated_at, deleted_at, title, description, amount, expense_date, category, reference_number, tenant_id, user_id) FROM stdin;
ab4156e6-2940-4f73-bbec-bc1efc165d4a	2026-04-18 11:26:00.315854+00	2026-04-18 11:26:00.315854+00	\N	EEEE		100.00	2026-04-18	software		7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, created_at, updated_at, deleted_at, question, answer, category, "order", status, tenant_id, product_id, page_id, user_id) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, created_at, updated_at, deleted_at, fieldname, originalname, encoding, mimetype, destination, filename, pdf_file, path, size, tenant_id, user_id) FROM stdin;
254fe75d-525e-4b2d-a73f-aae78b99b332	2026-04-01 12:58:59.716987+00	2026-04-01 12:58:59.716987+00	\N	file	63e1a453b53d5907ab06adb3aeeba854.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1775048339713_63e1a453b53d5907ab06adb3aeeba854.webp	\N	public/uploads/1775048339713_63e1a453b53d5907ab06adb3aeeba854.webp	16686	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
7c31f0bf-73a4-4fdc-b609-57e544f2448e	2026-04-01 12:59:04.3543+00	2026-04-01 12:59:04.3543+00	\N	file	96ee562e41468f26213d162c82cad2c4.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1775048344352_96ee562e41468f26213d162c82cad2c4.webp	\N	public/uploads/1775048344352_96ee562e41468f26213d162c82cad2c4.webp	41176	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
d5c583dd-b7bd-49a5-8985-6e851820319c	2026-04-01 12:59:06.995031+00	2026-04-01 12:59:06.995031+00	\N	file	9e04ea553b896e80bc884f5cdeffe160.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1775048346993_9e04ea553b896e80bc884f5cdeffe160.webp	\N	public/uploads/1775048346993_9e04ea553b896e80bc884f5cdeffe160.webp	28916	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
21afb175-9b1c-46c0-b61b-bf9d738e8c2f	2026-04-06 13:49:11.133201+00	2026-04-06 13:49:11.133201+00	\N	file	vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp	7bit	image/webp	public/uploads	1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp	\N	public/uploads/1775483351130_vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-nike-logo-119869268.webp	10444	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
f7bd6869-49ac-434a-a964-52dc4e91bf9b	2026-04-09 08:25:27.524564+00	2026-04-09 08:25:27.524564+00	\N	file	logo-full.png	7bit	image/png	public/uploads	1775723127503_logo-full.png	\N	public/uploads/1775723127503_logo-full.png	30482	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
5ce5a1c8-2d09-4ba4-be81-f8e9dc26b580	2026-05-17 04:18:54.329728+00	2026-05-17 04:18:54.329728+00	\N	file	Screenshot from 2026-04-27 13-14-19.png	7bit	image/png	public/uploads	1778991534310_Screenshot from 2026-04-27 13-14-19.png	\N	public/uploads/1778991534310_Screenshot from 2026-04-27 13-14-19.png	189015	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f
\.


--
-- Data for Name: fulfillment_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_items (id, created_at, updated_at, deleted_at, user_id, task_id, product_id, variant_id, bin_id, quantity, picked_quantity, status) FROM stdin;
\.


--
-- Data for Name: fulfillment_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_tasks (id, created_at, updated_at, deleted_at, user_id, order_id, status, warehouse_id, assigned_to_user_id, started_at, completed_at, tenant_id) FROM stdin;
\.


--
-- Data for Name: goods_received_note_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_received_note_items (id, created_at, updated_at, deleted_at, user_id, grn_id, product_id, variant_id, ordered_qty, received_qty, unit_cost, condition, tenant_id) FROM stdin;
8e000b5d-5628-43f5-9b88-9ee03eb46e50	2026-05-17 05:41:50.080664+00	2026-05-17 05:41:50.080664+00	\N	\N	4c1b996e-0cf3-424d-9c40-47abf0597284	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	100	100	68.00	NEW	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: goods_received_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_received_notes (id, created_at, updated_at, deleted_at, user_id, po_id, warehouse_id, status, tenant_id, supplier_id, received_by_user_id, branch_id, notes, "grnNumber", "receivedDate") FROM stdin;
4c1b996e-0cf3-424d-9c40-47abf0597284	2026-05-17 05:41:50.080664+00	2026-05-17 05:41:50.080664+00	\N	\N	5689a2ce-a873-46ad-bb90-d989580eae34	e8b8b58a-8659-4638-af2e-587bb9e82835	DRAFT	7f8b8b58-8659-4638-af2e-587bb9e82835	c49e0517-3518-4631-b388-51ed381db6e2	1a43be4e-51ab-4143-bc2c-092274f0742f	d8b8b58a-8659-4638-af2e-587bb9e82835	Auto GRN from PO PO-757524	GRN-202605-0001	2026-05-17 05:41:50.132
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, created_at, updated_at, deleted_at, user_id, applicant_id, interviewer_id, scheduled_at, feedback, score, status, tenant_id) FROM stdin;
\.


--
-- Data for Name: inventory_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_ledger (id, created_at, updated_at, deleted_at, user_id, product_id, variant_id, branch_id, warehouse_id, bin_id, supplier_id, type, quantity, balance_after, remaining_quantity, unit_cost, cogs_amount, reference_type, reference_id, tenant_id, remarks) FROM stdin;
993c4111-81cd-480c-869a-e01ca79ebe94	2026-05-17 05:44:26.098469+00	2026-05-17 05:44:26.098469+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	e8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	ADJUSTMENT	10.00	110.00	10.00	0.00	0.00	STOCK_ADJUSTMENT		7f8b8b58-8659-4638-af2e-587bb9e82835	\N
13659058-2470-47da-9cb0-cd2c939c3031	2026-05-17 05:46:14.545318+00	2026-05-17 05:46:14.545318+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	e8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	ADJUSTMENT	10.00	120.00	10.00	0.00	0.00	STOCK_ADJUSTMENT	dfsg	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
d2ecfc3f-2a8b-4cbd-a6e7-95cfddfc89cb	2026-05-17 05:51:29.808145+00	2026-05-17 05:51:29.808145+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	e8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	ADJUSTMENT	10.00	130.00	10.00	68.00	0.00	STOCK_ADJUSTMENT		7f8b8b58-8659-4638-af2e-587bb9e82835	\N
7c8aaa92-a585-49d2-88fb-59c51da12e53	2026-05-17 05:55:49.147775+00	2026-05-17 05:55:49.147775+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	e8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	ADJUSTMENT	10.00	140.00	10.00	68.00	0.00	STOCK_ADJUSTMENT	adsfasdf	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
4d103ab5-e3ab-4cbd-800b-3da5fe1eeb25	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	d8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	\N	SALE	-1.00	139.00	0.00	0.00	68.00	ORDER	e48839fa-620b-4ac4-bafb-b148db97a82b	7f8b8b58-8659-4638-af2e-587bb9e82835	POS Sale from Shift ID: e48839fa-620b-4ac4-bafb-b148db97a82b
f316c68a-d049-4b31-81ed-ad73404fcb0b	2026-05-17 05:41:50.228603+00	2026-05-17 09:46:33.866229+00	\N	\N	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	d8b8b58a-8659-4638-af2e-587bb9e82835	e8b8b58a-8659-4638-af2e-587bb9e82835	\N	c49e0517-3518-4631-b388-51ed381db6e2	PURCHASE	100.00	100.00	98.00	68.00	0.00	GOODS_RECEIVED_NOTE	GRN-202605-0001	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
5cc2186c-88ad-497e-ad32-66ee38e78a77	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	d8b8b58a-8659-4638-af2e-587bb9e82835	\N	\N	\N	SALE	-1.00	138.00	0.00	0.00	68.00	ORDER	f7bb5b74-e187-43f3-8c97-48879d621f2f	7f8b8b58-8659-4638-af2e-587bb9e82835	POS Sale - Order ID: f7bb5b74-e187-43f3-8c97-48879d621f2f
262d3668-b74f-4068-aa86-f1e1c5220850	2026-05-17 10:20:00.429271+00	2026-05-17 10:20:00.429271+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	\N	\N	\N	RESERVATION	-1.00	137.00	0.00	0.00	0.00	ORDER	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, created_at, updated_at, deleted_at, invoice_number, order_id, issue_date, due_date, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_postings (id, created_at, updated_at, deleted_at, user_id, title, description, requirements, department_id, location, salary_range_min, salary_range_max, status, tenant_id) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, created_at, updated_at, deleted_at, user_id, date, type, description, "referenceType", "referenceId", tenant_id, "totalAmount") FROM stdin;
14541b43-5e5b-4612-b195-8acfcfffdda7	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	2026-05-17 09:24:53.992945+00	SALES	COGS for Sale: e48839fa-620b-4ac4-bafb-b148db97a82b	INVENTORY_LEDGER	4d103ab5-e3ab-4cbd-800b-3da5fe1eeb25	7f8b8b58-8659-4638-af2e-587bb9e82835	68.00
af90c850-e6ea-436b-b4fb-098e3e8e1d93	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	2026-05-17 09:24:53.992945+00	SALES	POS Sale Synced - Payment Method: CASH	POS_SHIFT	e48839fa-620b-4ac4-bafb-b148db97a82b	7f8b8b58-8659-4638-af2e-587bb9e82835	68.00
ca0890c7-033b-4390-8902-4f12ce07550a	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	2026-05-17 09:46:33.866229+00	SALES	COGS for Sale: f7bb5b74-e187-43f3-8c97-48879d621f2f	INVENTORY_LEDGER	5cc2186c-88ad-497e-ad32-66ee38e78a77	7f8b8b58-8659-4638-af2e-587bb9e82835	68.00
465281f7-3ed2-4356-85da-3589d2e47137	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	2026-05-17 09:46:33.866229+00	SALES	POS Sale Synced - Order ID: f7bb5b74-e187-43f3-8c97-48879d621f2f - Payment Method: CASH	POS_SHIFT	e48839fa-620b-4ac4-bafb-b148db97a82b	7f8b8b58-8659-4638-af2e-587bb9e82835	68.00
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, created_at, updated_at, deleted_at, name, email, phone, address, subject, message, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: leave_quotas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_quotas (id, created_at, updated_at, deleted_at, user_id, employee_id, tenant_id, "leaveType", "totalDays", "usedDays", year) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, created_at, updated_at, deleted_at, user_id, employee_id, tenant_id, "leaveType", start_date, end_date, total_days, reason, status, approved_by_id, manager_note) FROM stdin;
\.


--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ledger_entries (id, created_at, updated_at, deleted_at, user_id, journal_entry_id, account_id, side, amount, "balanceAfter", tenant_id) FROM stdin;
856b2534-b070-4eb4-8053-cabeb6b3b75e	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	14541b43-5e5b-4612-b195-8acfcfffdda7	401a6936-8d5c-4239-a13d-0b7df0849095	DEBIT	68.00	68.00	7f8b8b58-8659-4638-af2e-587bb9e82835
c7c5bc2a-f3f2-4141-a914-4de53138c8bf	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	14541b43-5e5b-4612-b195-8acfcfffdda7	cf5d7571-b0db-43cd-983d-96c9b2c653be	CREDIT	68.00	-68.00	7f8b8b58-8659-4638-af2e-587bb9e82835
ef75d768-baeb-4f8e-8208-925315e041f2	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	af90c850-e6ea-436b-b4fb-098e3e8e1d93	96f386ff-c712-4ac5-969d-ce502d27e39b	DEBIT	68.00	68.00	7f8b8b58-8659-4638-af2e-587bb9e82835
6e81e6a7-57d1-4653-8545-601193e8067d	2026-05-17 09:24:53.992945+00	2026-05-17 09:24:53.992945+00	\N	\N	af90c850-e6ea-436b-b4fb-098e3e8e1d93	abd44cfa-9147-45dc-8454-2c8a9a53ffed	CREDIT	68.00	68.00	7f8b8b58-8659-4638-af2e-587bb9e82835
92063510-3a6a-4fa4-b37e-71a4cc2cb03c	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	ca0890c7-033b-4390-8902-4f12ce07550a	401a6936-8d5c-4239-a13d-0b7df0849095	DEBIT	68.00	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835
92e46412-65a5-4326-95ee-89782b8ac3ae	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	ca0890c7-033b-4390-8902-4f12ce07550a	cf5d7571-b0db-43cd-983d-96c9b2c653be	CREDIT	68.00	-136.00	7f8b8b58-8659-4638-af2e-587bb9e82835
0fe69453-6965-46c8-b260-3f813a6d6a33	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	465281f7-3ed2-4356-85da-3589d2e47137	96f386ff-c712-4ac5-969d-ce502d27e39b	DEBIT	68.00	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835
1c8c3e6c-cfa7-4670-9728-30e3ba9af628	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	\N	465281f7-3ed2-4356-85da-3589d2e47137	abd44cfa-9147-45dc-8454-2c8a9a53ffed	CREDIT	68.00	136.00	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1774867892750	InitialBaseline1774867892750
2	1774875292928	SubscriptionPlanEntityUpdate1774875292928
35	1774881224101	TrialStatusEnumUpdate1774881224101
36	1775728766873	AddTenantIdToSubscriber1775728766873
37	1776146877934	IsDefaultAddVariantEntity1776146877934
38	1776426507853	EmailAndNameReviewEntityRemove1776426507853
39	1776619062019	AddMessagingCampaign1776619062019
40	1776619787887	SettingEntitySmsFiledAdded1776619787887
41	1776621737940	AddPushDeviceEntity1776621737940
42	1776674962089	CampaignAddTargetOdiance1776674962089
43	1778982719557	AddAverageCostToProducts1778982719557
44	1778983562817	AddWholesalePricingToProducts1778983562817
45	1778984686792	CatalogPhase3Fields1778984686792
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, created_at, updated_at, deleted_at, order_id, product_id, variant_id, snapshot, quantity, unit_price, discount_amount, tax_amount, total_amount, tenant_id, user_id) FROM stdin;
86729312-9456-4362-8370-60569c0fad58	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	f7bb5b74-e187-43f3-8c97-48879d621f2f	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	\N	1	68.00	0.00	0.00	68.00	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
6dde8441-3acb-41b1-bacc-d294e1465605	2026-05-17 10:20:00.429271+00	2026-05-17 10:20:43.104045+00	\N	c1d25015-92b0-4e91-b504-91f65ef612de	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	{"price": 68, "productId": "3914599d-3d60-4861-9d8d-2da4eff8d6c9", "productName": "A quaerat quia fugit", "productImage": "http://localhost:3900/uploads/1778991534310_Screenshot from 2026-04-27 13-14-19.png"}	1	68.00	27.00	4.10	45.10	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: order_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_returns (id, created_at, updated_at, deleted_at, order_id, user_id, status, reason, admin_comment, refund_amount, items, tenant_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, created_at, updated_at, deleted_at, customer_name, customer_email, customer_phone, address, shipping_address_id, total_amount, shipping_fee, currency, currency_rate, status, payment_status, transaction_id, order_notes, user_id, tenant_id, tracking_id, courier_status, applied_coupon, coupon_discount_amount, tax_amount, delivery_zone, order_source, payment_method) FROM stdin;
2146b006-d092-49a0-9b92-9a1f95c710bc	2026-04-09 07:07:01.072455+00	2026-04-19 08:37:24.387128+00	\N	gowtam	gowtam@gmail.com	01767163545	gowtam, Jessore Computer City, Jess Tower, M K Rd, Jashore 7400, Jashore	12b02f2a-8fd7-4930-88b4-1072762e2ea0	150.00	60.00	USD	1.0000	completed	paid	\N	ddd	1a43be4e-51ab-4143-bc2c-092274f0742f	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	\N	\N	0.00	9.00	inside	website	\N
f7bb5b74-e187-43f3-8c97-48879d621f2f	2026-05-17 09:46:33.866229+00	2026-05-17 09:46:33.866229+00	\N	gowtam	gowtam@gmail.com	01767163545	Jessore Computer City, Jess Tower, M K Rd, Jashore 7400	\N	68.00	0.00	USD	1.0000	completed	paid	\N	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	\N	\N	0.00	0.00	\N	pos	cash
c1d25015-92b0-4e91-b504-91f65ef612de	2026-05-17 10:20:00.429271+00	2026-05-17 10:20:43.104045+00	\N	gowtam	gowtam@gmail.com	01767163545	Jashore	\N	105.10	60.00	USD	1.0000	completed	paid	\N	eeeeeeeeeee	1a43be4e-51ab-4143-bc2c-092274f0742f	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	\N	\N	0.00	4.10	inside	website	cod
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, created_at, updated_at, deleted_at, title, slug, is_home_page, "order", sections, meta_title, meta_description, og_image, typography, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, created_at, updated_at, deleted_at, order_id, user_id, transaction_id, amount, currency, method, status, gateway_response, tenant_id) FROM stdin;
f55c5ecd-351b-4f6c-a529-6ed089901898	2026-04-19 08:37:24.391934+00	2026-04-19 08:37:24.391934+00	\N	2146b006-d092-49a0-9b92-9a1f95c710bc	\N	MANUAL_COD_1776587844387	150.00	USD	cod	completed	{"note": "Manual update from admin dashboard"}	7f8b8b58-8659-4638-af2e-587bb9e82835
d300aa3d-f05e-445f-94ec-066e08926ee6	2026-05-17 10:20:43.112711+00	2026-05-17 10:20:43.112711+00	\N	c1d25015-92b0-4e91-b504-91f65ef612de	1a43be4e-51ab-4143-bc2c-092274f0742f	MANUAL_COD_1779013243104	105.10	USD	cod	completed	{"note": "Manual update from admin dashboard"}	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: payroll_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_batches (id, created_at, updated_at, deleted_at, user_id, name, period, total_amount, status, tenant_id, journal_entry_id) FROM stdin;
\.


--
-- Data for Name: payroll_slips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_slips (id, created_at, updated_at, deleted_at, user_id, batch_id, employee_id, basic_salary, total_allowances, total_deductions, net_salary, details, tenant_id) FROM stdin;
\.


--
-- Data for Name: performance_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_reviews (id, created_at, updated_at, deleted_at, user_id, employee_id, reviewer_id, review_period, score, comments, kpi_metrics, tenant_id) FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, created_at, updated_at, deleted_at, brand_name, brand_logo, support_email, hero, features, footer, user_id) FROM stdin;
3d663b86-a7c9-4130-b319-d8a832e8b61b	2026-03-30 12:27:21.617592+00	2026-03-30 12:27:21.617592+00	\N	YourSaaS		support@yoursaas.com	{"badge": "Next-Gen eCommerce Platform", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", "title": "Launch Your Store in Seconds, Not Days", "description": "The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.", "primaryBtnLink": "/create-store", "primaryBtnText": "Start Your Free Trial", "secondaryBtnLink": "#", "secondaryBtnText": "Watch Demo"}	[{"icon": "Globe", "title": "Multi-Tenant", "description": "Run separate stores for different brands or regions with isolated data."}, {"icon": "Zap", "title": "Instant Deployment", "description": "New stores are live in seconds with their own subdomain automatically."}, {"icon": "Shield", "title": "Secure Payments", "description": "Pre-integrated with SSLCommerz and more for secure transactions."}, {"icon": "BarChart3", "title": "Global Analytics", "description": "Monitor sales and customer behavior across all your stores."}, {"icon": "Users", "title": "User Management", "description": "Role-based access control for your team and store administrators."}, {"icon": "Target", "title": "SEO Optimized", "description": "Built-in SEO tools to help your products rank higher in search results."}]	{"socials": {"twitter": "#", "facebook": "#", "linkedin": "#", "instagram": "#"}, "copyright": "© 2024 YourSaaS. All rights reserved.", "description": "The ultimate multi-tenant eCommerce platform."}	\N
\.


--
-- Data for Name: pos_registers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_registers (id, created_at, updated_at, deleted_at, user_id, name, branch_id, status, tenant_id) FROM stdin;
79d0fda1-4a1c-420e-8455-691e2673d32b	2026-05-17 08:43:57.278816+00	2026-05-17 08:43:57.278816+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	Counter Register 1	d8b8b58a-8659-4638-af2e-587bb9e82835	ACTIVE	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: pos_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_shifts (id, created_at, updated_at, deleted_at, user_id, register_id, status, opening_time, closing_time, opening_balance, closing_balance, cash_sales, card_sales, mobile_sales, expected_closing_balance, difference, tenant_id, remarks) FROM stdin;
e48839fa-620b-4ac4-bafb-b148db97a82b	2026-05-17 08:57:44.946111+00	2026-05-17 09:46:33.866229+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	79d0fda1-4a1c-420e-8455-691e2673d32b	OPEN	2026-05-17 08:57:44.946111+00	\N	1000.00	\N	136.00	0.00	0.00	1136.00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: price_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_books (id, created_at, updated_at, deleted_at, user_id, name, code, type, currency, is_active, valid_from, valid_to, tenant_id) FROM stdin;
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, created_at, updated_at, deleted_at, name, "values", product_id, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: product_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_prices (id, created_at, updated_at, deleted_at, user_id, price_book_id, product_id, variant_id, price, min_quantity, tenant_id) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, created_at, updated_at, deleted_at, sku, price, low_stock_threshold, images, combination, product_id, tenant_id, user_id, is_default, average_cost, wholesale_price, barcode) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, created_at, updated_at, deleted_at, name, slug, description, short_description, price, is_review, discount_amount, discount_type, tax_rate, images, low_stock_threshold, status, category_id, brand_id, landing_page_id, faq_source, faq_ids, supplier_id, tenant_id, user_id, meta_title, meta_description, og_image, is_new, is_hot, is_sale, average_cost, wholesale_price, min_wholesale_qty, sku, barcode, product_type) FROM stdin;
3914599d-3d60-4861-9d8d-2da4eff8d6c9	2026-05-17 04:19:00.179137+00	2026-05-17 05:55:49.14509+00	\N	A quaerat quia fugit	a-quaerat-quia-fugit	<p>asdfasdfasdfasdf</p>	Qui hic et aut obcae	68.00	t	27.00	fixed	10.00	http://localhost:3900/uploads/1778991534310_Screenshot from 2026-04-27 13-14-19.png	50	active	08e707e1-ecbe-4c34-840a-80306b6e432b	f66c4c95-b32f-4a59-92b4-52ed7b61cebc	\N	manual		\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	Amet officia suscip	Sint nobis molestia	Incidunt labore vol	f	t	f	68.00	61.00	51	Autem enim delectus	Quia consectetur ex	SIMPLE
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, created_at, updated_at, deleted_at, name, slug, description, "promotionType", value, "targetType", target_id, min_order_value, start_date, end_date, is_active, tenant_id, user_id) FROM stdin;
6bbf897e-6cfd-4064-b58b-33abff621c03	2026-04-01 13:33:03.138808+00	2026-04-02 01:27:56.189079+00	2026-04-02 01:27:56.189079+00	sumer	sumer	dd	fixed	50.00	specific_category	4ecb71c4-e0ba-4f61-813b-42f3d7baaa4e	\N	2026-03-31 00:00:00	2026-04-03 00:00:00	t	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
5c0eafeb-98af-4ab2-9445-46268cdbdd97	2026-04-02 01:27:44.017708+00	2026-04-02 01:27:58.481616+00	2026-04-02 01:27:58.481616+00	new promotion	new-promotion	dd	fixed	55.00	specific_category	4ecb71c4-e0ba-4f61-813b-42f3d7baaa4e	\N	2026-04-01 00:00:00	2026-04-30 00:00:00	t	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
44b6b9e1-ef60-42dd-9e1f-4277d61f71e8	2026-04-13 09:19:55.862705+00	2026-04-13 10:41:04.527606+00	2026-04-13 10:41:04.527606+00	test promi	test-promi	dd sdfjsdaf	percentage	15.00	specific_category	08e707e1-ecbe-4c34-840a-80306b6e432b	\N	2026-04-12 00:00:00	2026-04-17 00:00:00	t	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
818e8122-5e14-4680-90b1-c03ac7acba55	2026-04-18 11:30:45.400509+00	2026-04-18 11:30:45.400509+00	\N	Summer barnad dis 50%	summer-barnad-dis-50	ss	percentage	50.00	specific_brand	f66c4c95-b32f-4a59-92b4-52ed7b61cebc	\N	2026-04-17 00:00:00	2026-04-24 00:00:00	t	7f8b8b58-8659-4638-af2e-587bb9e82835	\N
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, created_at, updated_at, deleted_at, purchase_order_id, product_id, variant_id, quantity, unit_price, user_id) FROM stdin;
6dc27124-14cb-4bd4-b752-c25ad22ae01b	2026-05-17 04:56:09.494169+00	2026-05-17 05:41:50.080664+00	\N	5689a2ce-a873-46ad-bb90-d989580eae34	3914599d-3d60-4861-9d8d-2da4eff8d6c9	\N	100	68.00	\N
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, created_at, updated_at, deleted_at, supplier_id, status, tenant_id, user_id, reference_number, total_amount, payment_status, paid_amount, pr_id, delivery_date) FROM stdin;
5689a2ce-a873-46ad-bb90-d989580eae34	2026-05-17 04:56:09.494169+00	2026-05-17 05:41:50.080664+00	\N	c49e0517-3518-4631-b388-51ed381db6e2	received	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	PO-757524	6800.00	pending	0.00	\N	\N
\.


--
-- Data for Name: purchase_requisition_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requisition_items (id, created_at, updated_at, deleted_at, user_id, pr_id, product_id, quantity, notes, tenant_id) FROM stdin;
\.


--
-- Data for Name: purchase_requisitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requisitions (id, created_at, updated_at, deleted_at, user_id, "prNumber", status, justification, required_date, tenant_id, requested_by, approved_by, branch_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, created_at, updated_at, deleted_at, user_id, rfq_id, supplier_id, "totalAmount", lead_time_days, status, "termsAndConditions", tenant_id) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, created_at, updated_at, deleted_at, product_id, rating, comment, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: rfqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfqs (id, created_at, updated_at, deleted_at, user_id, "rfqNumber", status, deadline_date, pr_id, tenant_id, created_by) FROM stdin;
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, created_at, updated_at, deleted_at, user_id, name, start_time, end_time, grace_minutes, is_night_shift, tenant_id) FROM stdin;
fe50de8d-604e-49ae-8f53-b23e3be06892	2026-05-17 08:37:48.745329+00	2026-05-17 08:37:48.745329+00	\N	\N	Standard Day Shift	09:00:00	18:00:00	15	f	7f8b8b58-8659-4638-af2e-587bb9e82835
1bc67c2c-c62f-47a3-89fa-47d17dfa5308	2026-05-17 08:37:48.752896+00	2026-05-17 08:37:48.752896+00	\N	\N	Security Night Shift	22:00:00	06:00:00	30	t	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_addresses (id, created_at, updated_at, deleted_at, user_id, tenant_id, label, recipient_name, phone, address, city, zone, is_default) FROM stdin;
12b02f2a-8fd7-4930-88b4-1072762e2ea0	2026-04-09 07:07:00.836599+00	2026-04-09 07:07:00.836599+00	\N	1a43be4e-51ab-4143-bc2c-092274f0742f	7f8b8b58-8659-4638-af2e-587bb9e82835	Home	gowtam	01767163545	Jessore Computer City, Jess Tower, M K Rd, Jashore 7400	Jashore	inside	t
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, created_at, updated_at, deleted_at, logo, brand_name, site_description, contact_email, contact_phone, whatsapp_phone, address, currency, currency_symbol, supported_currencies, social_links, marketing, smtp, payment, pathao_courier, steadfast_courier, shipping_config, navbar, footer, trust_badges, products_page, single_product_page, offers_page, robots_txt, tenant_id, user_id, sms) FROM stdin;
560a3c74-fad0-4835-8902-04f8e1817ced	2026-03-30 14:21:11.328821+00	2026-04-20 09:40:34.336852+00	\N		gowtam	Welcome to gowtam! Premium products and excellent service.	gowtam@gmail.com	01767163576	01767163576	Kayemkola,Jhikargacha,jashore	BDT	$	[]	{"twitter": "", "facebook": "", "linkedin": "", "instagram": ""}	{"facebookPixelId": "", "googleAnalyticsId": "", "googleSiteVerification": "", "facebookDomainVerification": ""}	{"from": "gowtampaul0@gmail.com", "host": "smtp.gmail.com", "pass": "wqym jewt wlkx gppe", "port": 465, "user": "gowtampaul0@gmail.com", "secure": false}	{"stripeSecretKey": "", "sslCommerzStoreId": "", "sslCommerzIsSandbox": false, "stripePublishableKey": "", "sslCommerzStorePassword": ""}	{"sandboxMode": false, "pathaoStoreId": "", "pathaoClientId": "", "pathaoPassword": "", "pathaoUsername": "", "pathaoClientSecret": ""}	{"apiKey": "", "secretKey": ""}	{"insideCityFee": 60, "outsideCityFee": 120, "freeShippingThreshold": 5000}	{"links": [{"href": "/", "label": "Home", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Shop", "order": 1, "isActive": true, "isOpenInNewTab": false}], "layout": "centered", "sticky": true, "maxWidth": "standard", "template": "classic", "textColor": "", "bottomShape": "none", "hoverEffect": "underline", "transparent": false, "borderRadius": "xl", "showCurrency": true, "backgroundColor": "", "shadowIntensity": "subtle", "backgroundPattern": "none"}	{"columns": "4", "sections": [{"links": [{"href": "/products", "label": "All Products", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products?sort=newest", "label": "Hot Releases", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Flash Sales", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 0, "title": "Shop Categories"}, {"links": [{"href": "/profile", "label": "Track Order", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Help Center", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/privacy", "label": "Return Policy", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 1, "title": "Support"}], "template": "classic", "topShape": "none", "copyright": "© 2026 gowtam. Made with Heart by Gowtam Kumar.", "textColor": "", "brandColor": "", "borderColor": "", "description": "Elevating your daily experience with premium sound and state-of-the-art design.", "glassEffect": false, "borderRadius": "none", "showNewsletter": true, "backgroundColor": "", "shadowIntensity": "none", "showSocialLinks": true, "backgroundPattern": "none"}	[]	{"bannerShow": true, "showBrands": true, "showSearch": true, "bannerStyle": "modern", "sidebarStyle": "modern", "bannerTagline": "", "bannerHeadline": "", "productsPerRow": 4, "showCategories": true, "showPriceFilter": true, "bannerSubheadline": ""}	{"showShare": true, "showStock": true, "showRating": true, "showFeatures": true, "showBreadcrumb": true, "showPromotions": true, "showStickyCart": true, "showProductFAQs": true, "showProductReviews": true, "showRelatedProducts": true, "relatedProductsPerRow": 4}	{"bannerShow": true, "showFilters": true, "bannerHeadline": "", "productsPerRow": 5, "bannerFullWidth": true, "bannerSubheadline": "", "bannerBackgroundColor": "black"}		7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f	{"apiKey": "INiiiBMqcEmbX8riOsf5", "senderId": "8809617625140"}
\.


--
-- Data for Name: staff_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_invitations (id, created_at, updated_at, deleted_at, email, role, tenant_id, token, status, expires_at, invited_by, user_id, branch_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, created_at, updated_at, deleted_at, email, is_active, user_id, tenant_id) FROM stdin;
72a72872-1959-4059-9081-2efd309e98f3	2026-04-09 09:51:31.337262+00	2026-04-09 09:51:31.337262+00	\N	demo@gmail.com	t	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
9a9fba80-7fcd-40f3-b45a-5361a767c88f	2026-04-20 08:56:48.293342+00	2026-04-20 08:56:48.293342+00	\N	gowtampaul0@gmail.com	t	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
94fdad30-b866-4c32-95ab-84eafbf935eb	2026-04-20 08:59:38.348147+00	2026-04-20 08:59:38.348147+00	\N	gowtamk217@gmail.com	t	\N	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: subscription_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_invoices (id, created_at, updated_at, deleted_at, invoice_number, tenant_id, subscription_plan_id, amount, currency, status, transaction_id, billing_date, payment_url, gateway_response, billing_cycle, user_id) FROM stdin;
9f505f8e-7b20-41e0-85a3-a853ca595831	2026-03-30 16:32:50.352484+00	2026-03-30 16:33:01.076073+00	\N	INV-1774888370350	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	144.00	BDT	completed	SUB-1774888370349	2026-03-30 16:32:50.35+00	\N	{"message": "Success from frontend"}	yearly	\N
a02aa792-103a-40f9-b6d2-ff4a8f73d20e	2026-03-30 17:11:47.064802+00	2026-03-30 17:11:47.064802+00	\N	INV-1774890707061	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	15.00	BDT	pending	SUB-1774890707061	2026-03-30 17:11:47.061+00	\N	\N	monthly	\N
cb464b91-2896-429f-8260-b8b31cc72339	2026-03-30 17:16:47.738738+00	2026-03-30 17:16:56.752318+00	\N	INV-1774891007734	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	144.00	BDT	completed	SUB-1774891007734	2026-03-30 17:16:47.734+00	\N	{"message": "Success from frontend"}	yearly	\N
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, created_at, updated_at, deleted_at, name, description, price, billing_cycle, features, is_active, user_id, monthly_price, yearly_price, is_popular) FROM stdin;
fd9e08e9-58f8-4987-933d-ac06fe80cb57	2026-03-30 12:36:53.857548+00	2026-03-30 12:56:02.225894+00	\N	Basic	this basic package	10.00	monthly	["10BG STOREAGTE"]	t	\N	10.00	8.00	f
782a19d8-fa79-46cb-995c-9ee04653f5e4	2026-03-30 12:37:28.750246+00	2026-03-30 12:57:09.034721+00	2026-03-30 12:57:09.034721+00	Pro	This pro backage	20.00	monthly	["30BB STOREAGE"]	t	\N	0.00	0.00	f
edb73312-d6c4-40e8-8788-68fa7a46cc51	2026-03-30 12:38:07.741511+00	2026-05-17 08:54:46.117696+00	\N	Pro	This is Pro Yearly package	15.00	yearly	["/admin", "/admin/branches", "/admin/warehouses", "/admin/products", "/admin/categories", "/admin/brands", "/admin/media", "/admin/reviews", "/admin/orders", "/admin/orders", "/admin/carts", "/admin/returns", "/admin/payments", "/admin/invoices", "/admin/customers", "/admin/purchases", "/admin/suppliers", "/admin/purchases", "/admin/purchases", "/admin/grn", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/hrm", "/admin/inventory", "/admin/fulfillment", "/admin/couriers", "/admin/expenses", "/admin/finance", "/admin/finance/profit-loss", "/admin/finance/balance-sheet", "/admin/finance/ledger", "/admin/coupons", "/admin/promotions", "/admin/leads", "/admin/subscribers", "/admin/campaigns", "/admin/reports/sales", "/admin/reports/finance", "/admin/reports/profit-loss", "/admin/reports/supplier-ledger", "/admin/reports/customer-ledger", "/admin/reports/cash-flow", "/admin/reports/export", "/admin/team", "/admin/profile", "/admin/settings", "/admin/settings/general", "/admin/settings/general", "/admin/settings/domain", "/admin/settings/currencies", "/admin/settings/social", "/admin/settings/trust", "/admin/settings/marketing", "/admin/settings/label", "/admin/settings/organization", "/admin/settings/email", "/admin/settings/email", "/admin/settings/sms", "/admin/settings/payment", "/admin/settings/courier", "/admin/settings/system", "/admin/pages", "/admin/faqs", "/admin/settings/navbar", "/admin/settings/navbar", "/admin/settings/footer", "/admin/settings/productsPage", "/admin/settings/singleProductPage", "/admin/settings/offersPage", "/admin/pos"]	t	\N	15.00	12.00	f
\.


--
-- Data for Name: supplier_ap_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_ap_ledger (id, created_at, updated_at, deleted_at, user_id, supplier_id, reference_type, reference_id, debit, credit, balance_after, remarks, tenant_id) FROM stdin;
16ece83b-9820-42c5-89a4-e589fcc21401	2026-05-17 05:09:50.817511+00	2026-05-17 05:09:50.817511+00	\N	\N	c49e0517-3518-4631-b388-51ed381db6e2	GRN	\N	0.00	6800.00	6800.00	Auto GRN: PO PO-757524	7f8b8b58-8659-4638-af2e-587bb9e82835
20bb2f2f-1be1-45b6-a5a0-3dcc3ad030b7	2026-05-17 05:41:50.080664+00	2026-05-17 05:41:50.080664+00	\N	\N	c49e0517-3518-4631-b388-51ed381db6e2	GRN	\N	0.00	6800.00	13600.00	Auto GRN: PO PO-757524	7f8b8b58-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: supplier_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_documents (id, created_at, updated_at, deleted_at, user_id, title, "fileUrl", "documentType", supplier_id, tenant_id) FROM stdin;
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, created_at, updated_at, deleted_at, purchase_order_id, supplier_id, amount, payment_date, payment_method, transaction_id, note, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, created_at, updated_at, deleted_at, address, tenant_id, user_id, code, "contactPerson", "taxId", "openingBalance", "currentBalance", status, performance, name, email, phone, contact_name, rating, lead_time_days, is_active, category) FROM stdin;
c49e0517-3518-4631-b388-51ed381db6e2	2026-05-17 04:21:59.101493+00	2026-05-17 04:21:59.101493+00	\N	Veritatis ab cumque 	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	Totam qui voluptate 			0.00	0.00	ACTIVE	\N	Voluptatem ipsa fu	vateje@mailinator.com	01789635654	\N	0.00	0	t	OTHER
\.


--
-- Data for Name: tenant_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_traffic (id, created_at, updated_at, deleted_at, tenant_id, date, request_count, last_updated, user_id) FROM stdin;
8b27c3ba-7f7b-4aba-9525-7059c22e9045	2026-04-06 13:24:02.937263+00	2026-04-06 13:24:02.937263+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-06	209	2026-04-06 14:45:10.937307+00	\N
8e5dddd4-bee3-4aa2-bec2-fe701f782a2d	2026-04-01 12:26:08.5753+00	2026-04-01 12:26:08.5753+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-01	354	2026-04-01 13:33:31.454794+00	\N
b7aa035f-0034-4fe4-858d-9289fc012f08	2026-04-02 01:05:28.774631+00	2026-04-02 01:05:28.774631+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-02	432	2026-04-02 02:03:53.049494+00	\N
95b2a61b-0d2b-45dc-bea3-ee851160a2f7	2026-04-07 02:00:26.575219+00	2026-04-07 02:00:26.575219+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-07	97	2026-04-07 13:22:43.679274+00	\N
ffd226a6-2850-4a16-963e-5db7dde8baff	2026-03-31 01:10:13.024564+00	2026-03-31 01:10:13.024564+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-03-31	137	2026-03-31 12:08:01.167964+00	\N
8e544fe2-170e-4204-bc3c-58238c038ad3	2026-03-30 14:21:12.76081+00	2026-03-30 14:21:12.76081+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-03-30	472	2026-03-30 17:17:15.799049+00	\N
8dab4297-de46-410b-a454-31a71f438bde	2026-04-03 11:31:39.515927+00	2026-04-03 11:31:39.515927+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-03	22	2026-04-03 12:57:02.488217+00	\N
441927be-eb15-4111-ab27-e005509129a2	2026-04-11 10:29:47.572509+00	2026-04-11 10:29:47.572509+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-11	224	2026-04-11 11:32:41.160297+00	\N
c8805d27-c140-4c5b-8088-f64e3791653e	2026-05-11 08:50:00.543698+00	2026-05-11 08:50:00.543698+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-05-11	32	2026-05-11 09:05:36.866248+00	\N
6d3c7177-3996-4045-aeb5-a44169e9de84	2026-04-09 03:32:08.371934+00	2026-04-09 03:32:08.371934+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-09	1490	2026-04-09 10:40:20.541469+00	\N
3b2d836f-05c6-41e2-8f17-453bdb1b6b4a	2026-04-19 08:34:24.18658+00	2026-04-19 08:34:24.18658+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-19	445	2026-04-19 12:11:24.265254+00	\N
e8ae85c7-e865-475a-8776-a4abefa9b4d5	2026-04-18 10:45:08.802127+00	2026-04-18 10:45:08.802127+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-18	465	2026-04-18 11:57:58.601224+00	\N
5b6644ed-6612-4714-8e33-9232d991b0a8	2026-04-20 08:25:47.601498+00	2026-04-20 08:25:47.601498+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-20	346	2026-04-20 11:07:29.878168+00	\N
1fa7109f-de96-42ba-a1b3-30c08aeaea9c	2026-04-13 03:53:36.77707+00	2026-04-13 03:53:36.77707+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-13	1307	2026-04-13 10:53:40.371482+00	\N
057d7a68-c7d9-42aa-b61b-0c1677605767	2026-04-08 10:51:43.041088+00	2026-04-08 10:51:43.041088+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-04-08	234	2026-04-08 12:15:58.822644+00	\N
49b04671-449e-43d6-86e8-59b98c36bda2	2026-05-17 04:16:40.578705+00	2026-05-17 04:16:40.578705+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-05-17	1321	2026-05-17 11:30:19.667412+00	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, created_at, updated_at, deleted_at, store_name, subdomain, custom_domain, custom_domain_status, custom_domain_verified_at, status, ssl_enabled, subscription_plan_id, subscription_billing_cycle, subscription_status, subscription_starts_at, subscription_ends_at, user_id) FROM stdin;
7f8b8b58-8659-4638-af2e-587bb9e82835	2026-03-30 14:21:11.233226+00	2026-03-30 17:16:56.761624+00	\N	gowtam	gowtam	\N	pending	\N	active	f	edb73312-d6c4-40e8-8788-68fa7a46cc51	yearly	active	2026-03-30 17:16:56.76+00	2027-03-30 17:16:56.76+00	1a43be4e-51ab-4143-bc2c-092274f0742f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, created_at, updated_at, deleted_at, name, email, username, password, phone, address, image, is_admin, is_email_verified, email_verification_token, reset_password_token, reset_password_expires, role, status, refresh_token, tenant_id, push_token, fcm_token, branch_id, warehouse_id) FROM stdin;
1a43be4e-51ab-4143-bc2c-092274f0742f	2026-03-30 14:21:11.300199+00	2026-05-17 11:25:09.952909+00	\N	gowtam	gowtam@gmail.com	gowtam	$2b$10$d.YLb8fG6QqjeY7DR2ZGe.SzawU1k6aeBHqx4HnqGHO953n2VDyl2	01767163545	Jessore Computer City, Jess Tower, M K Rd, Jashore 7400		f	f	c0db54b9802b37514f25953fd6d7db2fb7bebe4158831d1752b3a7cf22834a31	\N	\N	admin	active	$2b$10$2qseQCZmm5xIHbOK0J9hYec6hddOI5yaDFIyRdKUWAQ1yL/ahLdEO	7f8b8b58-8659-4638-af2e-587bb9e82835	\N	\N	\N	\N
c6bab8aa-d4bd-43dc-be9b-7a41a49a6c5d	2026-03-30 12:31:00.033196+00	2026-05-17 09:43:06.534508+00	\N	Super Admin	admin@gmail.com	admind	$2b$10$zrD.rpMESsbnnsesLq9tCeCIkF23HV2XpOO3MchoN1EWbeUda.17S	\N	\N	\N	t	f	\N	\N	\N	super_admin	active	$2b$10$9dyOADR0pI/D.V.fVd6ArejxDfVZo4rSiOQEGoPH4SxdbYrQ7hOwK	\N	\N	\N	\N	\N
\.


--
-- Data for Name: warehouse_bins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_bins (id, created_at, updated_at, deleted_at, user_id, warehouse_id, zone, bin_code, is_active) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, created_at, updated_at, deleted_at, user_id, name, code, location_type, address, is_active, ip_whitelist, tenant_id, branch_id) FROM stdin;
e8b8b58a-8659-4638-af2e-587bb9e82835	2026-05-17 04:43:54.693108+00	2026-05-17 04:43:54.693108+00	\N	\N	Main Warehouse	MAIN-WH	CENTRAL	\N	t	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	d8b8b58a-8659-4638-af2e-587bb9e82835
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, created_at, updated_at, deleted_at, user_id, product_id, tenant_id) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 75, true);


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


--
-- Name: goods_received_notes PK_038ce46920fcf1dd05dcb776514; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "PK_038ce46920fcf1dd05dcb776514" PRIMARY KEY (id);


--
-- Name: purchase_orders PK_05148947415204a897e8beb2553; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: reviews PK_231ae565c273ee700b283f15c1d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: product_variants PK_281e3f2c55652d6a22c0aa59fd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY (id);


--
-- Name: platform_settings PK_2934aeb70ec285196dcab4a2e96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT "PK_2934aeb70ec285196dcab4a2e96" PRIMARY KEY (id);


--
-- Name: fulfillment_tasks PK_2b87b8d698c5b4c30f4d1561340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_tasks
    ADD CONSTRAINT "PK_2b87b8d698c5b4c30f4d1561340" PRIMARY KEY (id);


--
-- Name: faqs PK_2ddf4f2c910f8e8fa2663a67bf0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY (id);


--
-- Name: product_prices PK_31c33ddacf759f7c0e5d327c4bb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT "PK_31c33ddacf759f7c0e5d327c4bb" PRIMARY KEY (id);


--
-- Name: fulfillment_items PK_32852edf7b9d94d64f1743cf792; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_items
    ADD CONSTRAINT "PK_32852edf7b9d94d64f1743cf792" PRIMARY KEY (id);


--
-- Name: pos_registers PK_337c429f2be84a4bc0543a27256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_registers
    ADD CONSTRAINT "PK_337c429f2be84a4bc0543a27256" PRIMARY KEY (id);


--
-- Name: payroll_batches PK_33e0dd8a73d141f26de843c06ec; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_batches
    ADD CONSTRAINT "PK_33e0dd8a73d141f26de843c06ec" PRIMARY KEY (id);


--
-- Name: campaign_logs PK_354bae2218a1c854c161c010cef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT "PK_354bae2218a1c854c161c010cef" PRIMARY KEY (id);


--
-- Name: promotions PK_380cecbbe3ac11f0e5a7c452c34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY (id);


--
-- Name: warehouse_bins PK_3f5b2d69d36e76d3857cd03dd27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_bins
    ADD CONSTRAINT "PK_3f5b2d69d36e76d3857cd03dd27" PRIMARY KEY (id);


--
-- Name: employee_personal_details PK_45c1de779ed4e0a369f1d14e04f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_personal_details
    ADD CONSTRAINT "PK_45c1de779ed4e0a369f1d14e04f" PRIMARY KEY (id);


--
-- Name: performance_reviews PK_46f39f620497eb3de4fe6dafdef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "PK_46f39f620497eb3de4fe6dafdef" PRIMARY KEY (id);


--
-- Name: pos_shifts PK_48c3a5a8edb67abfa198992a0fa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_shifts
    ADD CONSTRAINT "PK_48c3a5a8edb67abfa198992a0fa" PRIMARY KEY (id);


--
-- Name: purchase_requisitions PK_498c368a925013267fce72a3dfe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "PK_498c368a925013267fce72a3dfe" PRIMARY KEY (id);


--
-- Name: purchase_requisition_items PK_4d7ac4d98eb592d0f631c0445bd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT "PK_4d7ac4d98eb592d0f631c0445bd" PRIMARY KEY (id);


--
-- Name: product_attributes PK_4fa18fc5c893cb9894fc40ca921; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "PK_4fa18fc5c893cb9894fc40ca921" PRIMARY KEY (id);


--
-- Name: tenants PK_53be67a04681c66b87ee27c9321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY (id);


--
-- Name: warehouses PK_56ae21ee2432b2270b48867e4be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY (id);


--
-- Name: inventory_ledger PK_56ba7cef08f3263f90418ddfeef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "PK_56ba7cef08f3263f90418ddfeef" PRIMARY KEY (id);


--
-- Name: order_returns PK_579752300589723ade9af5f1122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "PK_579752300589723ade9af5f1122" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: invoices PK_668cef7c22a427fd822cc1be3ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY (id);


--
-- Name: quotations PK_6c00eb8ba181f28c21ffba7ecb1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "PK_6c00eb8ba181f28c21ffba7ecb1" PRIMARY KEY (id);


--
-- Name: files PK_6c16b9093a142e0e7613b04a3d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY (id);


--
-- Name: ledger_entries PK_6efcb84411d3f08b08450ae75d5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT "PK_6efcb84411d3f08b08450ae75d5" PRIMARY KEY (id);


--
-- Name: cart_items PK_6fccf5ec03c172d27a28a82928b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY (id);


--
-- Name: subscription_invoices PK_7050ae7d81f0f0207b8f1cd2efc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "PK_7050ae7d81f0f0207b8f1cd2efc" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: supplier_payments PK_76e86f3194494faf999c652dbf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "PK_76e86f3194494faf999c652dbf9" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: campaigns PK_831e3fcd4fc45b4e4c3f57a9ee4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY (id);


--
-- Name: departments PK_839517a681a86bb84cbcc6a1e9d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY (id);


--
-- Name: staff_invitations PK_842e5346c92d8003bdb2140b6c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_invitations
    ADD CONSTRAINT "PK_842e5346c92d8003bdb2140b6c8" PRIMARY KEY (id);


--
-- Name: attendance_sessions PK_84d565d9e484e2bcdaf4a9e1890; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "PK_84d565d9e484e2bcdaf4a9e1890" PRIMARY KEY (id);


--
-- Name: shifts PK_84d692e367e4d6cdf045828768c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: attendance_events PK_8d7140035888f869932307395ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "PK_8d7140035888f869932307395ad" PRIMARY KEY (id);


--
-- Name: pages PK_8f21ed625aa34c8391d636b7d3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY (id);


--
-- Name: supplier_ap_ledger PK_8fa1fb8aacbcafa67973745af8a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ap_ledger
    ADD CONSTRAINT "PK_8fa1fb8aacbcafa67973745af8a" PRIMARY KEY (id);


--
-- Name: expenses PK_94c3ceb17e3140abc9282c20610; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY (id);


--
-- Name: tenant_traffic PK_964cb6b12e433147b9525500a12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_traffic
    ADD CONSTRAINT "PK_964cb6b12e433147b9525500a12" PRIMARY KEY (id);


--
-- Name: subscription_plans PK_9ab8fe6918451ab3d0a4fb6bb0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY (id);


--
-- Name: designations PK_a0f024b99b1491a03fc421858ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT "PK_a0f024b99b1491a03fc421858ea" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: journal_entries PK_a70368e64230434457c8d007ab3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY (id);


--
-- Name: brands PK_b0c437120b624da1034a81fc561; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY (id);


--
-- Name: devices PK_b1514758245c12daf43486dd1f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY (id);


--
-- Name: supplier_documents PK_b1df9d525587d1d8341e07dc0b2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT "PK_b1df9d525587d1d8341e07dc0b2" PRIMARY KEY (id);


--
-- Name: carts PK_b5f695a59f5ebb50af3c8160816; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: employees PK_b9535a98350d5b26e7eb0c26af4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY (id);


--
-- Name: applicants PK_c02ec3c46124479ce758ca50943; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT "PK_c02ec3c46124479ce758ca50943" PRIMARY KEY (id);


--
-- Name: payroll_slips PK_c17ec3c92af50f8a2e4fd7a5ba9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT "PK_c17ec3c92af50f8a2e4fd7a5ba9" PRIMARY KEY (id);


--
-- Name: employee_documents PK_c19b36f5e604e261fb430293b68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT "PK_c19b36f5e604e261fb430293b68" PRIMARY KEY (id);


--
-- Name: rfqs PK_c8b7481584218bdee534e5fc436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT "PK_c8b7481584218bdee534e5fc436" PRIMARY KEY (id);


--
-- Name: subscribers PK_cbe0a7a9256c826f403c0236b67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY (id);


--
-- Name: goods_received_note_items PK_cbfa9462fc165dc391657dd0fe3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_note_items
    ADD CONSTRAINT "PK_cbfa9462fc165dc391657dd0fe3" PRIMARY KEY (id);


--
-- Name: shipping_addresses PK_cced78984eddbbe24470f226692; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT "PK_cced78984eddbbe24470f226692" PRIMARY KEY (id);


--
-- Name: leads PK_cd102ed7a9a4ca7d4d8bfeba406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY (id);


--
-- Name: wishlists PK_d0a37f2848c5d268d315325f359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY (id);


--
-- Name: leave_requests PK_d3abcf9a16cef1450129e06fa9f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY (id);


--
-- Name: coupons PK_d7ea8864a0150183770f3e9a8cb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY (id);


--
-- Name: employee_shift_assignments PK_da032101783f14df9c52c8b49cc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shift_assignments
    ADD CONSTRAINT "PK_da032101783f14df9c52c8b49cc" PRIMARY KEY (id);


--
-- Name: job_postings PK_dda635ece382c8ad2d90a179182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT "PK_dda635ece382c8ad2d90a179182" PRIMARY KEY (id);


--
-- Name: debit_notes PK_e1f73e65add1542776ce7087fae; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "PK_e1f73e65add1542776ce7087fae" PRIMARY KEY (id);


--
-- Name: site_settings PK_e4290e8371a166d7e066d131f6e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY (id);


--
-- Name: leave_quotas PK_e64c478eccd6dcdff596c4199da; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_quotas
    ADD CONSTRAINT "PK_e64c478eccd6dcdff596c4199da" PRIMARY KEY (id);


--
-- Name: purchase_order_items PK_e8b7568d25c41e3290db596b312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY (id);


--
-- Name: price_books PK_e9999c434e93f27e9e3ee547d2d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_books
    ADD CONSTRAINT "PK_e9999c434e93f27e9e3ee547d2d" PRIMARY KEY (id);


--
-- Name: campaign_messages PK_f87903f05267f5fd956a4b9a12e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_messages
    ADD CONSTRAINT "PK_f87903f05267f5fd956a4b9a12e" PRIMARY KEY (id);


--
-- Name: interviews PK_fd41af1f96d698fa33c2f070f47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY (id);


--
-- Name: employees REL_2d83c53c3e553a48dadb9722e3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "REL_2d83c53c3e553a48dadb9722e3" UNIQUE (user_id);


--
-- Name: employee_personal_details REL_cddd142f40ac341309375dc80a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_personal_details
    ADD CONSTRAINT "REL_cddd142f40ac341309375dc80a" UNIQUE (employee_id);


--
-- Name: subscribers UQ_09f9f571635df2421b2f2c6799b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "UQ_09f9f571635df2421b2f2c6799b" UNIQUE (tenant_id, email);


--
-- Name: purchase_requisitions UQ_0aa2dff0488999b1f08280b8caf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "UQ_0aa2dff0488999b1f08280b8caf" UNIQUE ("prNumber");


--
-- Name: price_books UQ_0f39e1fbc5a419219d5968d7c40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_books
    ADD CONSTRAINT "UQ_0f39e1fbc5a419219d5968d7c40" UNIQUE (code);


--
-- Name: rfqs UQ_1f87b36a05a4c5d113944e67a6c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT "UQ_1f87b36a05a4c5d113944e67a6c" UNIQUE ("rfqNumber");


--
-- Name: tenants UQ_21bb89e012fa5b58532009c1601; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "UQ_21bb89e012fa5b58532009c1601" UNIQUE (subdomain);


--
-- Name: debit_notes UQ_29b9a88df3860890109d6b19a8a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "UQ_29b9a88df3860890109d6b19a8a" UNIQUE ("debitNoteNumber");


--
-- Name: products UQ_464f927ae360106b783ed0b4106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE (slug);


--
-- Name: staff_invitations UQ_4e6e40d4c9c24f41c1067b55140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_invitations
    ADD CONSTRAINT "UQ_4e6e40d4c9c24f41c1067b55140" UNIQUE (token);


--
-- Name: subscription_invoices UQ_6c62b1deceda54a99b61dec8857; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "UQ_6c62b1deceda54a99b61dec8857" UNIQUE (invoice_number);


--
-- Name: goods_received_notes UQ_7d5121a8e10392f758b27b32e68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "UQ_7d5121a8e10392f758b27b32e68" UNIQUE ("grnNumber");


--
-- Name: branches UQ_9c06cbb83feb2f0be6263bd47ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE (code);


--
-- Name: tenant_traffic UQ_a95e4df16abc74c950152d7fff7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_traffic
    ADD CONSTRAINT "UQ_a95e4df16abc74c950152d7fff7" UNIQUE (tenant_id, date);


--
-- Name: tenants UQ_c985fa3986f7383dff567479e5d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "UQ_c985fa3986f7383dff567479e5d" UNIQUE (custom_domain);


--
-- Name: employees UQ_c9a09b8e6588fb4d3c9051c8937; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "UQ_c9a09b8e6588fb4d3c9051c8937" UNIQUE (employee_id);


--
-- Name: warehouses UQ_d8b96d60ff9a288f5ed862280d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "UQ_d8b96d60ff9a288f5ed862280d9" UNIQUE (code);


--
-- Name: invoices UQ_d8f8d3788694e1b3f96c42c36fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE (invoice_number);


--
-- Name: promotions UQ_dbea049b681d15564f46dd7bdee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "UQ_dbea049b681d15564f46dd7bdee" UNIQUE (slug);


--
-- Name: IDX_04881b33675e7ddf92129b64b8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_04881b33675e7ddf92129b64b8" ON public.faqs USING btree (tenant_id, status);


--
-- Name: IDX_06459bf7e16da39c1b0150efa2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_06459bf7e16da39c1b0150efa2" ON public.warehouse_bins USING btree (warehouse_id, bin_code);


--
-- Name: IDX_06faa5bf9f2eb5de43a60a77a6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_06faa5bf9f2eb5de43a60a77a6" ON public.leads USING btree (tenant_id, status, created_at);


--
-- Name: IDX_09106b8068aeaf74fa33666df8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_09106b8068aeaf74fa33666df8" ON public.warehouses USING btree (tenant_id);


--
-- Name: IDX_0c99e87bda40ab7c44e49e88ef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0c99e87bda40ab7c44e49e88ef" ON public.subscribers USING btree (user_id);


--
-- Name: IDX_0cc9de879be93ba0d4932374f3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0cc9de879be93ba0d4932374f3" ON public.goods_received_notes USING btree (supplier_id);


--
-- Name: IDX_0cec49f8f07d5ac4a8a9bbe6ac; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0cec49f8f07d5ac4a8a9bbe6ac" ON public.leads USING btree (user_id);


--
-- Name: IDX_0e2bb90ad27fa92910185792ac; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0e2bb90ad27fa92910185792ac" ON public.tenants USING btree (user_id);


--
-- Name: IDX_0f39e1fbc5a419219d5968d7c4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0f39e1fbc5a419219d5968d7c4" ON public.price_books USING btree (code);


--
-- Name: IDX_101cb71b62ea2d4e9cc56ab54d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_101cb71b62ea2d4e9cc56ab54d" ON public.carts USING btree (user_id, tenant_id);


--
-- Name: IDX_106adbcf4272984ce0abcff439; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_106adbcf4272984ce0abcff439" ON public.pos_registers USING btree (user_id);


--
-- Name: IDX_109638590074998bb72a2f2cf0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON public.users USING btree (tenant_id);


--
-- Name: IDX_114cc380ce4148ae166ab38b30; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_114cc380ce4148ae166ab38b30" ON public.promotions USING btree (tenant_id, is_active, start_date, end_date);


--
-- Name: IDX_1230ebe7ada6874d51ae7cc7e9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1230ebe7ada6874d51ae7cc7e9" ON public.purchase_orders USING btree (tenant_id, created_at);


--
-- Name: IDX_1305ca07dbe242a6607a865069; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1305ca07dbe242a6607a865069" ON public.payroll_batches USING btree (user_id);


--
-- Name: IDX_134735cc45672b90b366c20dc3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_134735cc45672b90b366c20dc3" ON public.files USING btree (filename);


--
-- Name: IDX_1359c25adc8fa78046837f7ad6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1359c25adc8fa78046837f7ad6" ON public.branches USING btree (user_id);


--
-- Name: IDX_1512e7007d2e169f908f327b1d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1512e7007d2e169f908f327b1d" ON public.quotations USING btree (tenant_id, rfq_id);


--
-- Name: IDX_1530a6f15d3c79d1b70be98f2b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1530a6f15d3c79d1b70be98f2b" ON public.products USING btree (brand_id);


--
-- Name: IDX_17310b479882076ceab00449de; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_17310b479882076ceab00449de" ON public.goods_received_note_items USING btree (user_id);


--
-- Name: IDX_176b502c5ebd6e72cafbd9d6f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_176b502c5ebd6e72cafbd9d6f7" ON public.products USING btree (user_id);


--
-- Name: IDX_17b75f0f14fb4d037575c03174; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_17b75f0f14fb4d037575c03174" ON public.journal_entries USING btree (user_id);


--
-- Name: IDX_1846199852a695713b1f8f5e9a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1846199852a695713b1f8f5e9a" ON public.products USING btree (status);


--
-- Name: IDX_200e5746777e616b84e6c7ad63; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_200e5746777e616b84e6c7ad63" ON public.audit_logs USING btree (tenant_id, user_id);


--
-- Name: IDX_2018133f9c98a1f0783df9dec8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_2018133f9c98a1f0783df9dec8" ON public.product_variants USING btree (sku, tenant_id);


--
-- Name: IDX_22802f1b9ba6a6c757db786ad5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_22802f1b9ba6a6c757db786ad5" ON public.staff_invitations USING btree (user_id);


--
-- Name: IDX_2296b7fe012d95646fa41921c8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2296b7fe012d95646fa41921c8" ON public.categories USING btree (user_id);


--
-- Name: IDX_22ad5445514d484d9a67095b59; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_22ad5445514d484d9a67095b59" ON public.products USING btree (tenant_id, status);


--
-- Name: IDX_2389a3857bde26f56e0158ffbf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2389a3857bde26f56e0158ffbf" ON public.inventory_ledger USING btree (tenant_id, created_at);


--
-- Name: IDX_251d2dc3142ba865791253952f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_251d2dc3142ba865791253952f" ON public.supplier_ap_ledger USING btree (tenant_id, supplier_id);


--
-- Name: IDX_26daf5e433d6fb88ee32ce9363; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_26daf5e433d6fb88ee32ce9363" ON public.invoices USING btree (user_id);


--
-- Name: IDX_2ba8f6cfe0b7273b7b02c4eb32; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2ba8f6cfe0b7273b7b02c4eb32" ON public.expenses USING btree (tenant_id, expense_date);


--
-- Name: IDX_2bdb57e1ec2d5840ca37fdab4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2bdb57e1ec2d5840ca37fdab4c" ON public.warehouse_bins USING btree (user_id);


--
-- Name: IDX_2c6c64cd3c3aee8d48133efe90; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2c6c64cd3c3aee8d48133efe90" ON public.inventory_ledger USING btree (product_id, warehouse_id, created_at);


--
-- Name: IDX_2cf0031fe3f0a6a5e9085f390f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2cf0031fe3f0a6a5e9085f390f" ON public.product_attributes USING btree (user_id);


--
-- Name: IDX_2d83c53c3e553a48dadb9722e3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2d83c53c3e553a48dadb9722e3" ON public.employees USING btree (user_id);


--
-- Name: IDX_2ec1c94a977b940d85a4f498ae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2ec1c94a977b940d85a4f498ae" ON public.carts USING btree (user_id);


--
-- Name: IDX_3000dad1da61b29953f0747632; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3000dad1da61b29953f0747632" ON public.accounts USING btree (user_id);


--
-- Name: IDX_30bb2773875fbf546ec501e80a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_30bb2773875fbf546ec501e80a" ON public.order_returns USING btree (tenant_id, status);


--
-- Name: IDX_31012b1e575208e16b424c673f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_31012b1e575208e16b424c673f" ON public.warehouses USING btree (user_id);


--
-- Name: IDX_33bb5b1b1a3a7e8b9787cd8778; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_33bb5b1b1a3a7e8b9787cd8778" ON public.brands USING btree (tenant_id);


--
-- Name: IDX_33d621ab2004ace0d32a966e25; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_33d621ab2004ace0d32a966e25" ON public.purchase_order_items USING btree (user_id);


--
-- Name: IDX_36185444bc768b82f77474da1f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_36185444bc768b82f77474da1f" ON public.price_books USING btree (tenant_id);


--
-- Name: IDX_370d90560b45463224f0d52f58; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_370d90560b45463224f0d52f58" ON public.attendance_sessions USING btree (user_id);


--
-- Name: IDX_3816a9b513ab119616229d3356; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3816a9b513ab119616229d3356" ON public.faqs USING btree ("order");


--
-- Name: IDX_3c324ca49dabde7ffc0ef64675; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3c324ca49dabde7ffc0ef64675" ON public.payments USING btree (transaction_id);


--
-- Name: IDX_3c65399d58c2822d294f2d2d2b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3c65399d58c2822d294f2d2d2b" ON public.suppliers USING btree (tenant_id, name);


--
-- Name: IDX_3cf0d953e8fd321408e733300d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3cf0d953e8fd321408e733300d" ON public.price_books USING btree (user_id);


--
-- Name: IDX_3f92bb44026cedfe235c8b9124; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3f92bb44026cedfe235c8b9124" ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: IDX_3ff6acc06ad70019391e569bb9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3ff6acc06ad70019391e569bb9" ON public.purchase_requisition_items USING btree (user_id);


--
-- Name: IDX_410b4085b8d4b01fcca3f3119c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_410b4085b8d4b01fcca3f3119c" ON public.supplier_ap_ledger USING btree (user_id);


--
-- Name: IDX_427785468fb7d2733f59e7d7d3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON public.payments USING btree (user_id);


--
-- Name: IDX_438c5b8ce512b45f7b2e612e4e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_438c5b8ce512b45f7b2e612e4e" ON public.pos_shifts USING btree (user_id);


--
-- Name: IDX_45455b21195721407322ddce00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_45455b21195721407322ddce00" ON public.campaigns USING btree (user_id);


--
-- Name: IDX_464f927ae360106b783ed0b410; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_464f927ae360106b783ed0b410" ON public.products USING btree (slug);


--
-- Name: IDX_484acb2ff8f3e134dfac8f01e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_484acb2ff8f3e134dfac8f01e8" ON public.files USING btree (tenant_id);


--
-- Name: IDX_4913e660b7e5d3f608b66a65e5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4913e660b7e5d3f608b66a65e5" ON public.campaigns USING btree (tenant_id, schedule_time);


--
-- Name: IDX_4955938be91f3cb485f7f4ce08; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4955938be91f3cb485f7f4ce08" ON public.attendance_events USING btree (user_id);


--
-- Name: IDX_49a0ca239d34e74fdc4e0625a7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_49a0ca239d34e74fdc4e0625a7" ON public.expenses USING btree (user_id);


--
-- Name: IDX_4a6d39417d6eddd86a8bf46762; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4a6d39417d6eddd86a8bf46762" ON public.journal_entries USING btree (tenant_id, date);


--
-- Name: IDX_4b6e11fff64f245174ce7dacf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4b6e11fff64f245174ce7dacf9" ON public.purchase_requisitions USING btree (user_id);


--
-- Name: IDX_4cc30fe1cdd5088a8e361f8af7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4cc30fe1cdd5088a8e361f8af7" ON public.audit_logs USING btree (tenant_id, entity, entity_id);


--
-- Name: IDX_4ce4551861f199b3b7cc293f57; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4ce4551861f199b3b7cc293f57" ON public.leave_quotas USING btree (user_id);


--
-- Name: IDX_5272ac3aa931eedb14cd8789d6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5272ac3aa931eedb14cd8789d6" ON public.purchase_orders USING btree (status);


--
-- Name: IDX_52a29f8fc340e73d124af517f2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_52a29f8fc340e73d124af517f2" ON public.users USING btree (username, tenant_id);


--
-- Name: IDX_553196ea54b383f352401962af; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_553196ea54b383f352401962af" ON public.product_variants USING btree (tenant_id);


--
-- Name: IDX_56c49bb53c0054f25f74b5cceb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_56c49bb53c0054f25f74b5cceb" ON public.inventory_ledger USING btree (user_id);


--
-- Name: IDX_59b7a79203c34cf04826d76b8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_59b7a79203c34cf04826d76b8b" ON public.orders USING btree (tenant_id, status);


--
-- Name: IDX_5a58f726a41264c8b3e86d4a1d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5a58f726a41264c8b3e86d4a1d" ON public.users USING btree (branch_id);


--
-- Name: IDX_5c05a13f9932917cd53bab95ea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5c05a13f9932917cd53bab95ea" ON public.employee_personal_details USING btree (user_id);


--
-- Name: IDX_5d26f3a7d19d380538c9dd57d0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5d26f3a7d19d380538c9dd57d0" ON public.brands USING btree (user_id);


--
-- Name: IDX_5e9bee993b4ce35c3606cda194; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5e9bee993b4ce35c3606cda194" ON public.devices USING btree (user_id);


--
-- Name: IDX_5ff14a5ef35dc76d5c17a3ce06; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5ff14a5ef35dc76d5c17a3ce06" ON public.debit_notes USING btree (user_id);


--
-- Name: IDX_62bc3ca685907e29d6349c2bb6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_62bc3ca685907e29d6349c2bb6" ON public.pos_shifts USING btree (register_id);


--
-- Name: IDX_6343513e20e2deab45edfce131; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6343513e20e2deab45edfce131" ON public.product_variants USING btree (product_id);


--
-- Name: IDX_637c1fee01f70e1a7eb00261ac; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_637c1fee01f70e1a7eb00261ac" ON public.platform_settings USING btree (user_id);


--
-- Name: IDX_6385a745d9e12a89b859bb2562; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6385a745d9e12a89b859bb2562" ON public.cart_items USING btree (cart_id);


--
-- Name: IDX_63c92aac73493bb6c8b9298152; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_63c92aac73493bb6c8b9298152" ON public.goods_received_notes USING btree (user_id);


--
-- Name: IDX_63db05d5bb2f8dd831ed655021; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_63db05d5bb2f8dd831ed655021" ON public.categories USING btree (tenant_id, slug);


--
-- Name: IDX_64041df367e8f55c25143f7857; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_64041df367e8f55c25143f7857" ON public.inventory_ledger USING btree (type);


--
-- Name: IDX_66181e465a65c2ddcfa9c00c9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_66181e465a65c2ddcfa9c00c9c" ON public.suppliers USING btree (email);


--
-- Name: IDX_676b27b97853130f8e6b410875; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_676b27b97853130f8e6b410875" ON public.accounts USING btree (tenant_id, code);


--
-- Name: IDX_69514139889223d5b2611e3a3b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_69514139889223d5b2611e3a3b" ON public.pos_shifts USING btree (tenant_id);


--
-- Name: IDX_69e7c84542b637b399d0a88f9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_69e7c84542b637b399d0a88f9c" ON public.faqs USING btree (tenant_id);


--
-- Name: IDX_6b9285677a2fa46c96d6f88e9f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6b9285677a2fa46c96d6f88e9f" ON public.promotions USING btree (user_id);


--
-- Name: IDX_6bfc43bdb3bd3dd0b3c1920acc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6bfc43bdb3bd3dd0b3c1920acc" ON public.inventory_ledger USING btree (product_id);


--
-- Name: IDX_6c039ced2230e9c06f2a872000; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6c039ced2230e9c06f2a872000" ON public.payments USING btree (tenant_id, created_at);


--
-- Name: IDX_6d320737541c7c4d2a6f0f9d91; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6d320737541c7c4d2a6f0f9d91" ON public.leave_requests USING btree (user_id);


--
-- Name: IDX_6efd91be9be9719763fa9442b1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6efd91be9be9719763fa9442b1" ON public.campaign_logs USING btree (user_id);


--
-- Name: IDX_6fab7980dee7f667919aa5e635; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6fab7980dee7f667919aa5e635" ON public.products USING btree (tenant_id, created_at);


--
-- Name: IDX_701ba9039b36234c51b66a23b5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_701ba9039b36234c51b66a23b5" ON public.invoices USING btree (tenant_id, created_at);


--
-- Name: IDX_718255c609f0cf64754afc09b6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_718255c609f0cf64754afc09b6" ON public.tenant_traffic USING btree (user_id);


--
-- Name: IDX_7193c6a267c706a9786ccab3cd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7193c6a267c706a9786ccab3cd" ON public.supplier_documents USING btree (tenant_id, supplier_id);


--
-- Name: IDX_721ee0ef460a60741c8eecf05e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_721ee0ef460a60741c8eecf05e" ON public.fulfillment_tasks USING btree (tenant_id, status);


--
-- Name: IDX_728447781a30bc3fcfe5c2f1cd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_728447781a30bc3fcfe5c2f1cd" ON public.reviews USING btree (user_id);


--
-- Name: IDX_745e9b5cbcf0863a7bbe5c8042; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_745e9b5cbcf0863a7bbe5c8042" ON public.quotations USING btree (user_id);


--
-- Name: IDX_75ab21980cabc5be328df3e49c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_75ab21980cabc5be328df3e49c" ON public.shipping_addresses USING btree (user_id);


--
-- Name: IDX_79c8469a874e63c012c447a9e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_79c8469a874e63c012c447a9e8" ON public.applicants USING btree (user_id);


--
-- Name: IDX_7b76cb4ef420f634acf5526b6d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7b76cb4ef420f634acf5526b6d" ON public.inventory_ledger USING btree (variant_id);


--
-- Name: IDX_7f24e8687a99cdf941196fa541; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7f24e8687a99cdf941196fa541" ON public.performance_reviews USING btree (user_id);


--
-- Name: IDX_8417854ce8bdd0d651c35e1c7c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8417854ce8bdd0d651c35e1c7c" ON public.ledger_entries USING btree (user_id);


--
-- Name: IDX_86bd8a5d8548cc6b42d906577f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_86bd8a5d8548cc6b42d906577f" ON public.designations USING btree (user_id);


--
-- Name: IDX_8848968b61761dabc955081229; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8848968b61761dabc955081229" ON public.campaigns USING btree (tenant_id, status);


--
-- Name: IDX_898d14750b88319b89b1ab66cd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON public.audit_logs USING btree (tenant_id, created_at);


--
-- Name: IDX_8b5bb3a42b7798ad7feff4e7d5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_8b5bb3a42b7798ad7feff4e7d5" ON public.pages USING btree (slug, tenant_id);


--
-- Name: IDX_8c0b7730483344897167bb44d3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8c0b7730483344897167bb44d3" ON public.purchase_requisitions USING btree (tenant_id, status);


--
-- Name: IDX_8cba26b24bbea7cff67a6f6f75; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8cba26b24bbea7cff67a6f6f75" ON public.purchase_orders USING btree (tenant_id, status);


--
-- Name: IDX_94345beaf0d77ab85803e70ee2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_94345beaf0d77ab85803e70ee2" ON public.rfqs USING btree (tenant_id, status);


--
-- Name: IDX_96be556486c8f8aa18cb4fbf52; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_96be556486c8f8aa18cb4fbf52" ON public.goods_received_notes USING btree (po_id);


--
-- Name: IDX_96cb9079b02fd51caaf18a417a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_96cb9079b02fd51caaf18a417a" ON public.expenses USING btree (tenant_id, category);


--
-- Name: IDX_98ceb5433a66707b9c649503dc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_98ceb5433a66707b9c649503dc" ON public.pages USING btree (user_id);


--
-- Name: IDX_99283b63c5ce97cf7a4dcc0880; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_99283b63c5ce97cf7a4dcc0880" ON public.supplier_payments USING btree (user_id);


--
-- Name: IDX_995d8194c43edfc98838cabc5a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_995d8194c43edfc98838cabc5a" ON public.products USING btree (created_at);


--
-- Name: IDX_9974c02e617aa96ddafd840432; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9974c02e617aa96ddafd840432" ON public.coupons USING btree (user_id);


--
-- Name: IDX_9a5f6868c96e0069e699f33e12; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9a5f6868c96e0069e699f33e12" ON public.products USING btree (category_id);


--
-- Name: IDX_9c06cbb83feb2f0be6263bd47e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9c06cbb83feb2f0be6263bd47e" ON public.branches USING btree (code);


--
-- Name: IDX_9c365ebf78f0e8a6d9e4827ea7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9c365ebf78f0e8a6d9e4827ea7" ON public.products USING btree (tenant_id);


--
-- Name: IDX_9d2f4aa7859760e2d5a0cf6df2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9d2f4aa7859760e2d5a0cf6df2" ON public.campaign_logs USING btree (campaign_id, status);


--
-- Name: IDX_9e37be5051b435614120c03fea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9e37be5051b435614120c03fea" ON public.payments USING btree (tenant_id, status, created_at);


--
-- Name: IDX_a1eb449d8def14d83cf82066f9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a1eb449d8def14d83cf82066f9" ON public.cart_items USING btree (tenant_id);


--
-- Name: IDX_a214be3c4c97fe5e9d99244a0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a214be3c4c97fe5e9d99244a0e" ON public.goods_received_notes USING btree (tenant_id, status);


--
-- Name: IDX_a511b1124729b644c1c26cbb09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a511b1124729b644c1c26cbb09" ON public.order_returns USING btree (user_id);


--
-- Name: IDX_a7435dbb7583938d5e7d137604; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a7435dbb7583938d5e7d137604" ON public.files USING btree (user_id);


--
-- Name: IDX_a7c156b50ceb901e8937ca6dff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a7c156b50ceb901e8937ca6dff" ON public.employee_shift_assignments USING btree (user_id);


--
-- Name: IDX_a922b820eeef29ac1c6800e826; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a922b820eeef29ac1c6800e826" ON public.orders USING btree (user_id);


--
-- Name: IDX_aa17633b6f91f0856429b1ed0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_aa17633b6f91f0856429b1ed0e" ON public.reviews USING btree (product_id, status);


--
-- Name: IDX_ab49c86b738822028b47a8fd14; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ab49c86b738822028b47a8fd14" ON public.subscribers USING btree (created_at);


--
-- Name: IDX_abc255cfe0b1f3068a61b6c4a5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_abc255cfe0b1f3068a61b6c4a5" ON public.purchase_orders USING btree (reference_number);


--
-- Name: IDX_ac0f09364e3701d9ed35435288; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ac0f09364e3701d9ed35435288" ON public.invoices USING btree (status);


--
-- Name: IDX_ad7ed3ce1291be18c2d5519ca3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ad7ed3ce1291be18c2d5519ca3" ON public.product_prices USING btree (tenant_id, price_book_id, variant_id);


--
-- Name: IDX_ae37b2127e66dee337a6d767bb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ae37b2127e66dee337a6d767bb" ON public.fulfillment_items USING btree (user_id);


--
-- Name: IDX_af2072cbfcceb7465cf42e27f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_af2072cbfcceb7465cf42e27f7" ON public.product_prices USING btree (user_id);


--
-- Name: IDX_afda2c28a51cefdf5123416c61; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_afda2c28a51cefdf5123416c61" ON public.ledger_entries USING btree (tenant_id, account_id);


--
-- Name: IDX_b002207b48235b3302382997a8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b002207b48235b3302382997a8" ON public.inventory_ledger USING btree (branch_id);


--
-- Name: IDX_b15428f362be2200922952dc26; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b15428f362be2200922952dc26" ON public.brands USING btree (slug);


--
-- Name: IDX_b3aba33228acd59f2d734c31b8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b3aba33228acd59f2d734c31b8" ON public.suppliers USING btree (user_id);


--
-- Name: IDX_b43e7c0396e495d1b8ac8eaede; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b43e7c0396e495d1b8ac8eaede" ON public.categories USING btree (tenant_id, parent_id);


--
-- Name: IDX_b5e6331a1a7d61c25d7a25cab8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b5e6331a1a7d61c25d7a25cab8" ON public.wishlists USING btree (user_id);


--
-- Name: IDX_b66f30bdb828384bad81071007; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b66f30bdb828384bad81071007" ON public.reviews USING btree (tenant_id, status);


--
-- Name: IDX_b6fa4e1fab2f948fb14c736cd7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b6fa4e1fab2f948fb14c736cd7" ON public.interviews USING btree (user_id);


--
-- Name: IDX_b7213c20c1ecdc6597abc8f121; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b7213c20c1ecdc6597abc8f121" ON public.cart_items USING btree (user_id);


--
-- Name: IDX_b9450a13a4299d264c9e53fb80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_b9450a13a4299d264c9e53fb80" ON public.coupons USING btree (tenant_id, code);


--
-- Name: IDX_b97323410523f74139fbd6a84e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b97323410523f74139fbd6a84e" ON public.subscribers USING btree (tenant_id);


--
-- Name: IDX_b97bc210a32b35c2d79d2ba53b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_b97bc210a32b35c2d79d2ba53b" ON public.devices USING btree (tenant_id, token);


--
-- Name: IDX_ba024979f57eb3d0aba10bdf68; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ba024979f57eb3d0aba10bdf68" ON public.pos_registers USING btree (branch_id);


--
-- Name: IDX_baf89b47ea379dd0193a50b865; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_baf89b47ea379dd0193a50b865" ON public.campaign_logs USING btree (user_id, status);


--
-- Name: IDX_bcd8e1a275860e70f3a876d718; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bcd8e1a275860e70f3a876d718" ON public.order_returns USING btree (order_id);


--
-- Name: IDX_bd2726fd31b35443f2245b93ba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON public.audit_logs USING btree (user_id);


--
-- Name: IDX_bf96e1bdbc1ce2ec1f7fe66e8c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bf96e1bdbc1ce2ec1f7fe66e8c" ON public.order_items USING btree (user_id);


--
-- Name: IDX_c13036093717212c2c6aa111c7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c13036093717212c2c6aa111c7" ON public.purchase_orders USING btree (user_id);


--
-- Name: IDX_c1e0ac7aaa9f72d841672ed4d7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c1e0ac7aaa9f72d841672ed4d7" ON public.inventory_ledger USING btree (warehouse_id);


--
-- Name: IDX_c3552aebc40ff83b0c2e52120b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c3552aebc40ff83b0c2e52120b" ON public.job_postings USING btree (user_id);


--
-- Name: IDX_c7784149a7cd8b44d19d0c3f19; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c7784149a7cd8b44d19d0c3f19" ON public.payroll_slips USING btree (user_id);


--
-- Name: IDX_ca271a35d93a52d6f151cee539; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ca271a35d93a52d6f151cee539" ON public.debit_notes USING btree (tenant_id, status);


--
-- Name: IDX_cd5e019c76a79a59e9188d2aae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cd5e019c76a79a59e9188d2aae" ON public.orders USING btree (tenant_id, created_at);


--
-- Name: IDX_ceffb1aa5a324b58fddce116a4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ceffb1aa5a324b58fddce116a4" ON public.product_prices USING btree (tenant_id, price_book_id, product_id);


--
-- Name: IDX_cf5e6cdf36a9417326cfd8e9c7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cf5e6cdf36a9417326cfd8e9c7" ON public.supplier_documents USING btree (user_id);


--
-- Name: IDX_cfda26ebe7afbafa5c21e7fc07; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cfda26ebe7afbafa5c21e7fc07" ON public.supplier_ap_ledger USING btree (reference_id);


--
-- Name: IDX_d0ed38c8f82903c6b83c7922f5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d0ed38c8f82903c6b83c7922f5" ON public.leads USING btree (tenant_id, created_at);


--
-- Name: IDX_d16a885aa88447ccfd010e739b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d16a885aa88447ccfd010e739b" ON public.purchase_orders USING btree (supplier_id);


--
-- Name: IDX_d1a87bf9de7503bb1b6fc0cb85; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d1a87bf9de7503bb1b6fc0cb85" ON public.warehouses USING btree (branch_id);


--
-- Name: IDX_d1e5aa828aec675770f3f435bd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_d1e5aa828aec675770f3f435bd" ON public.wishlists USING btree (user_id, product_id, tenant_id);


--
-- Name: IDX_d22f25edb23158a4711f5b905b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d22f25edb23158a4711f5b905b" ON public.product_prices USING btree (tenant_id);


--
-- Name: IDX_d22fbd5ac43b8fdc54f60cfdb9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d22fbd5ac43b8fdc54f60cfdb9" ON public.faqs USING btree (tenant_id, page_id);


--
-- Name: IDX_d2b77e27dc1654786ce5c2bcbc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d2b77e27dc1654786ce5c2bcbc" ON public.pos_registers USING btree (tenant_id);


--
-- Name: IDX_d53f91f073c6732c75b8204369; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d53f91f073c6732c75b8204369" ON public.coupons USING btree (tenant_id, is_active, expiry_date);


--
-- Name: IDX_d8b96d60ff9a288f5ed862280d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d8b96d60ff9a288f5ed862280d" ON public.warehouses USING btree (code);


--
-- Name: IDX_dc1e84f1d1e75e990952c40859; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dc1e84f1d1e75e990952c40859" ON public.shifts USING btree (user_id);


--
-- Name: IDX_dddc9634d319b4d5926b3a1173; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dddc9634d319b4d5926b3a1173" ON public.departments USING btree (user_id);


--
-- Name: IDX_df755303f609501b08a24a5de2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_df755303f609501b08a24a5de2" ON public.employee_documents USING btree (user_id);


--
-- Name: IDX_e00f0f4e7d2f6ec5960e75ee6a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e00f0f4e7d2f6ec5960e75ee6a" ON public.campaign_messages USING btree (user_id);


--
-- Name: IDX_e3c0b0f92d46ec87d2aedb0895; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e3c0b0f92d46ec87d2aedb0895" ON public.site_settings USING btree (user_id);


--
-- Name: IDX_e96e3e3799fe4b21ad07b3b3cf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e96e3e3799fe4b21ad07b3b3cf" ON public.product_variants USING btree (user_id);


--
-- Name: IDX_e9cb84fd8d4bca16c52818155b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e9cb84fd8d4bca16c52818155b" ON public.pages USING btree (tenant_id, is_home_page);


--
-- Name: IDX_e9f4c2efab52114c4e99e28efb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_e9f4c2efab52114c4e99e28efb" ON public.users USING btree (email, tenant_id);


--
-- Name: IDX_ea43f73792e24d01f0cb2f19e2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ea43f73792e24d01f0cb2f19e2" ON public.subscription_invoices USING btree (user_id);


--
-- Name: IDX_ea83c3b911906a3578de2340fd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ea83c3b911906a3578de2340fd" ON public.invoices USING btree (order_id);


--
-- Name: IDX_eb42e8a25edaa6a06096d6df05; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_eb42e8a25edaa6a06096d6df05" ON public.purchase_orders USING btree (payment_status);


--
-- Name: IDX_ec69ef8e48f54e2b8899131c86; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ec69ef8e48f54e2b8899131c86" ON public.faqs USING btree (status);


--
-- Name: IDX_ee2f108dd2b132b4b225f6cf0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ee2f108dd2b132b4b225f6cf0e" ON public.promotions USING btree (tenant_id, slug);


--
-- Name: IDX_efa33cfbfffe5e5ddf10b8360e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_efa33cfbfffe5e5ddf10b8360e" ON public.faqs USING btree (user_id);


--
-- Name: IDX_f06b516e6bdc44a370ca7d69a0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f06b516e6bdc44a370ca7d69a0" ON public.subscription_plans USING btree (user_id);


--
-- Name: IDX_f1256cfc368e9645fd5800cf28; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f1256cfc368e9645fd5800cf28" ON public.faqs USING btree (tenant_id, product_id);


--
-- Name: IDX_f15ecc57ada8be2b81e2b01676; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f15ecc57ada8be2b81e2b01676" ON public.rfqs USING btree (user_id);


--
-- Name: IDX_fa43267f9de1621105d7f0fea4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fa43267f9de1621105d7f0fea4" ON public.users USING btree (warehouse_id);


--
-- Name: IDX_fbc7f85d8e77874d70b4836501; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fbc7f85d8e77874d70b4836501" ON public.fulfillment_tasks USING btree (user_id);


--
-- Name: IDX_fda619979f40a6a44fc9baf02c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fda619979f40a6a44fc9baf02c" ON public.branches USING btree (tenant_id);


--
-- Name: warehouses FK_09106b8068aeaf74fa33666df8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "FK_09106b8068aeaf74fa33666df8f" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: subscribers FK_0c99e87bda40ab7c44e49e88ef8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "FK_0c99e87bda40ab7c44e49e88ef8" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: goods_received_notes FK_0cc9de879be93ba0d4932374f31; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_0cc9de879be93ba0d4932374f31" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: leads FK_0cec49f8f07d5ac4a8a9bbe6ac2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "FK_0cec49f8f07d5ac4a8a9bbe6ac2" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tenants FK_0e2bb90ad27fa92910185792aca; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "FK_0e2bb90ad27fa92910185792aca" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: products FK_0ec433c1e1d444962d592d86c86; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_0ec433c1e1d444962d592d86c86" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: ledger_entries FK_100a4dde20ac61937a6a4e58b59; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT "FK_100a4dde20ac61937a6a4e58b59" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fulfillment_tasks FK_1067cc297f42a34d1c0786bfc76; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_tasks
    ADD CONSTRAINT "FK_1067cc297f42a34d1c0786bfc76" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users FK_109638590074998bb72a2f2cf08; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_ledger FK_1184214277d74acbb3f00c5fbb9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_1184214277d74acbb3f00c5fbb9" FOREIGN KEY (bin_id) REFERENCES public.warehouse_bins(id) ON DELETE SET NULL;


--
-- Name: order_items FK_145532db85752b29c57d2b7b1f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: departments FK_146fd7019eea73f8ee7bbb52d4a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "FK_146fd7019eea73f8ee7bbb52d4a" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: products FK_1530a6f15d3c79d1b70be98f2be; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: payroll_slips FK_154dab7a84c100c94bb9ab9f0da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT "FK_154dab7a84c100c94bb9ab9f0da" FOREIGN KEY (batch_id) REFERENCES public.payroll_batches(id);


--
-- Name: subscription_invoices FK_15c466d30506fda5b2b1bbf2461; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "FK_15c466d30506fda5b2b1bbf2461" FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: coupons FK_169338eead44e81c390fbc64626; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "FK_169338eead44e81c390fbc64626" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: devices FK_17569dfbcf467d8959b04e3b6d4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "FK_17569dfbcf467d8959b04e3b6d4" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: products FK_176b502c5ebd6e72cafbd9d6f70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_176b502c5ebd6e72cafbd9d6f70" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: wishlists FK_1a697e458e79055b7fc3ff0e8e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "FK_1a697e458e79055b7fc3ff0e8e0" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_shift_assignments FK_1dcd8603c898d7a12fab61756d7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shift_assignments
    ADD CONSTRAINT "FK_1dcd8603c898d7a12fab61756d7" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: campaign_logs FK_1f6e0536f9ac0189d6654b414da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT "FK_1f6e0536f9ac0189d6654b414da" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: supplier_payments FK_220694212ec38b4aa2fb02ed622; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_220694212ec38b4aa2fb02ed622" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: categories FK_2296b7fe012d95646fa41921c8b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchase_requisitions FK_231144082fd3d212c2bfe327abc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "FK_231144082fd3d212c2bfe327abc" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_orders FK_237678c98436e0abb48b3060c82; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_237678c98436e0abb48b3060c82" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_requisitions FK_24302a66e9c6d4277977388030f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "FK_24302a66e9c6d4277977388030f" FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: leads FK_2440046dd05066e882bb68a780c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "FK_2440046dd05066e882bb68a780c" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_prices FK_24ba10adbe347d03679f1f76ed7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT "FK_24ba10adbe347d03679f1f76ed7" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: wishlists FK_2662acbb3868b1f0077fda61dd2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "FK_2662acbb3868b1f0077fda61dd2" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: invoices FK_26daf5e433d6fb88ee32ce93637; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: goods_received_note_items FK_270d0073ae758725c4e9e5bd31f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_note_items
    ADD CONSTRAINT "FK_270d0073ae758725c4e9e5bd31f" FOREIGN KEY (grn_id) REFERENCES public.goods_received_notes(id) ON DELETE CASCADE;


--
-- Name: subscription_invoices FK_2a5257dfb60f446b19c287f416d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "FK_2a5257dfb60f446b19c287f416d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_attributes FK_2cf0031fe3f0a6a5e9085f390fe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "FK_2cf0031fe3f0a6a5e9085f390fe" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: performance_reviews FK_2d11995817c8d382fb313dc46cf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "FK_2d11995817c8d382fb313dc46cf" FOREIGN KEY (reviewer_id) REFERENCES public.employees(id);


--
-- Name: performance_reviews FK_2d1d9e46c9f01ac7c07d59b2756; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "FK_2d1d9e46c9f01ac7c07d59b2756" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees FK_2d83c53c3e553a48dadb9722e38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: employees FK_2de5d6e4fb3345f18bc467017f0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_2de5d6e4fb3345f18bc467017f0" FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: carts FK_2ec1c94a977b940d85a4f498aea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_shift_assignments FK_2f55d21c44c8931bdbcac5de6a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shift_assignments
    ADD CONSTRAINT "FK_2f55d21c44c8931bdbcac5de6a3" FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: rfqs FK_30005d74217b9b0449de19362bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT "FK_30005d74217b9b0449de19362bc" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cart_items FK_30e89257a105eab7648a35c7fce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: rfqs FK_31b0e677d1904b7b9a05e130965; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT "FK_31b0e677d1904b7b9a05e130965" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: brands FK_33bb5b1b1a3a7e8b9787cd87784; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "FK_33bb5b1b1a3a7e8b9787cd87784" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items FK_33d621ab2004ace0d32a966e250; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_33d621ab2004ace0d32a966e250" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: fulfillment_items FK_3463b057406b0ae332f239e9a03; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_items
    ADD CONSTRAINT "FK_3463b057406b0ae332f239e9a03" FOREIGN KEY (task_id) REFERENCES public.fulfillment_tasks(id) ON DELETE CASCADE;


--
-- Name: price_books FK_36185444bc768b82f77474da1f8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_books
    ADD CONSTRAINT "FK_36185444bc768b82f77474da1f8" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payroll_slips FK_367c4b720ff36d002a1e40f140f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT "FK_367c4b720ff36d002a1e40f140f" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: quotations FK_380fefb3a1def272e5d52e57ac6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "FK_380fefb3a1def272e5d52e57ac6" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: supplier_documents FK_399a19b7cb4420b5816d6963f7f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT "FK_399a19b7cb4420b5816d6963f7f" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: inventory_ledger FK_39d8fb6ebe4ad5c1dce043372fd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_39d8fb6ebe4ad5c1dce043372fd" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: campaign_messages FK_39d9109a0190b76618b817e669d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_messages
    ADD CONSTRAINT "FK_39d9109a0190b76618b817e669d" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: purchase_requisition_items FK_3a85b6d396db938f0432cb1d085; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT "FK_3a85b6d396db938f0432cb1d085" FOREIGN KEY (pr_id) REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE;


--
-- Name: leave_quotas FK_3d665cc7d47ffd43e1e6815a352; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_quotas
    ADD CONSTRAINT "FK_3d665cc7d47ffd43e1e6815a352" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: purchase_order_items FK_3f92bb44026cedfe235c8b91244; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: pos_shifts FK_438c5b8ce512b45f7b2e612e4ef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_shifts
    ADD CONSTRAINT "FK_438c5b8ce512b45f7b2e612e4ef" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: designations FK_43d6a115dd09868d51494f7545d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT "FK_43d6a115dd09868d51494f7545d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: invoices FK_440f531f452dcc4389d201b9d4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_440f531f452dcc4389d201b9d4b" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: campaigns FK_45455b21195721407322ddce007; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "FK_45455b21195721407322ddce007" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employees FK_457a39c666de2686596e502eb8c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_457a39c666de2686596e502eb8c" FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: pages FK_46e907ed4e2f32850168d175571; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "FK_46e907ed4e2f32850168d175571" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fulfillment_items FK_48ec3970152a0cdcdc9a52a1020; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_items
    ADD CONSTRAINT "FK_48ec3970152a0cdcdc9a52a1020" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: expenses FK_49a0ca239d34e74fdc4e0625a78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: supplier_ap_ledger FK_4ab83cf4c98666c3e813f17a8a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ap_ledger
    ADD CONSTRAINT "FK_4ab83cf4c98666c3e813f17a8a3" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: goods_received_note_items FK_4be7e263013f51bcbf9a8c910c1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_note_items
    ADD CONSTRAINT "FK_4be7e263013f51bcbf9a8c910c1" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: debit_notes FK_4c008cca2c9cccfdc35438ad287; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "FK_4c008cca2c9cccfdc35438ad287" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: leave_requests FK_4c0727a131644d680e44c3d2aa8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "FK_4c0727a131644d680e44c3d2aa8" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: orders FK_527dd6efd5f3402f729c6b3e826; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_527dd6efd5f3402f729c6b3e826" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: leave_requests FK_52b4b7c7d295e204add6dbe0a09; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "FK_52b4b7c7d295e204add6dbe0a09" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: quotations FK_54170079daf8b118378ac70e4f3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "FK_54170079daf8b118378ac70e4f3" FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: inventory_ledger FK_56c49bb53c0054f25f74b5cceb5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_56c49bb53c0054f25f74b5cceb5" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employees FK_588d18aeef0504067e40c682788; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_588d18aeef0504067e40c682788" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: journal_entries FK_58fffc97d300e8164ccd16fc06b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "FK_58fffc97d300e8164ccd16fc06b" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: users FK_5a58f726a41264c8b3e86d4a1de; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_5a58f726a41264c8b3e86d4a1de" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: goods_received_notes FK_5b18e72296cb99beb364cb56208; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_5b18e72296cb99beb364cb56208" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: applicants FK_5bd81614c08fc9089833dc9a5a5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT "FK_5bd81614c08fc9089833dc9a5a5" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id);


--
-- Name: purchase_requisitions FK_5cca83cedd76d3c9682946a81e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "FK_5cca83cedd76d3c9682946a81e0" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE SET NULL;


--
-- Name: brands FK_5d26f3a7d19d380538c9dd57d06; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "FK_5d26f3a7d19d380538c9dd57d06" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: categories FK_5d4fe23b360b1b9e16a3f41727f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_5d4fe23b360b1b9e16a3f41727f" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: supplier_payments FK_5e3f9443818b705f6ab86b44764; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_5e3f9443818b705f6ab86b44764" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: devices FK_5e9bee993b4ce35c3606cda194c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pos_shifts FK_62bc3ca685907e29d6349c2bb60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_shifts
    ADD CONSTRAINT "FK_62bc3ca685907e29d6349c2bb60" FOREIGN KEY (register_id) REFERENCES public.pos_registers(id) ON DELETE CASCADE;


--
-- Name: product_variants FK_6343513e20e2deab45edfce1316; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: platform_settings FK_637c1fee01f70e1a7eb00261ac8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT "FK_637c1fee01f70e1a7eb00261ac8" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cart_items FK_6385a745d9e12a89b859bb25623; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: goods_received_notes FK_64b280163070c84f11ee50cd9a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_64b280163070c84f11ee50cd9a3" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: debit_notes FK_65ea41ec57af9303a0b59b57150; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "FK_65ea41ec57af9303a0b59b57150" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employees FK_678a3540f843823784b0fe4a4f2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_678a3540f843823784b0fe4a4f2" FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: orders FK_67b8be57fc38bda573d2a8513ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec" FOREIGN KEY (shipping_address_id) REFERENCES public.shipping_addresses(id) ON DELETE SET NULL;


--
-- Name: pos_shifts FK_69514139889223d5b2611e3a3bf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_shifts
    ADD CONSTRAINT "FK_69514139889223d5b2611e3a3bf" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: faqs FK_69e7c84542b637b399d0a88f9c6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "FK_69e7c84542b637b399d0a88f9c6" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: promotions FK_6b9285677a2fa46c96d6f88e9fd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "FK_6b9285677a2fa46c96d6f88e9fd" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_ledger FK_6bfc43bdb3bd3dd0b3c1920acc7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_6bfc43bdb3bd3dd0b3c1920acc7" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: fulfillment_tasks FK_6c988442ae97f354daa7ab10e06; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_tasks
    ADD CONSTRAINT "FK_6c988442ae97f354daa7ab10e06" FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id);


--
-- Name: campaign_logs FK_6efd91be9be9719763fa9442b14; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT "FK_6efd91be9be9719763fa9442b14" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs FK_6f18d459490bb48923b1f40bdb7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_requisition_items FK_6f4e39a6f962728a781987c24c6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT "FK_6f4e39a6f962728a781987c24c6" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: debit_notes FK_709e8544f7ec8863ff94e804a8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "FK_709e8544f7ec8863ff94e804a8f" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: job_postings FK_71549ebdaf6647e51de711396c3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT "FK_71549ebdaf6647e51de711396c3" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_traffic FK_718255c609f0cf64754afc09b66; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_traffic
    ADD CONSTRAINT "FK_718255c609f0cf64754afc09b66" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews FK_728447781a30bc3fcfe5c2f1cdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: goods_received_note_items FK_738156720604f8ba0f64a8215cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_note_items
    ADD CONSTRAINT "FK_738156720604f8ba0f64a8215cd" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fulfillment_tasks FK_7697d776ec131a678ea7238f64b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_tasks
    ADD CONSTRAINT "FK_7697d776ec131a678ea7238f64b" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: goods_received_notes FK_789e938604faa35c1e0f0a69e0e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_789e938604faa35c1e0f0a69e0e" FOREIGN KEY (received_by_user_id) REFERENCES public.users(id);


--
-- Name: inventory_ledger FK_7b76cb4ef420f634acf5526b6d5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_7b76cb4ef420f634acf5526b6d5" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: employee_documents FK_7fce49bcbfe15a73953b2809944; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT "FK_7fce49bcbfe15a73953b2809944" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: applicants FK_8041f9543fa1b34388d8254d4d4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT "FK_8041f9543fa1b34388d8254d4d4" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: product_prices FK_8218c69c7f5a3706662101fa788; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT "FK_8218c69c7f5a3706662101fa788" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: tenants FK_84279188abf7dad6cb6fe2e3d9c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "FK_84279188abf7dad6cb6fe2e3d9c" FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: carts FK_846bcf9b09d81d7e8b67096ef38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "FK_846bcf9b09d81d7e8b67096ef38" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: warehouse_bins FK_84f09c9d0a3762f2155a6bbd985; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_bins
    ADD CONSTRAINT "FK_84f09c9d0a3762f2155a6bbd985" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: payroll_batches FK_86e2d4e69b27e437e0780483c76; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_batches
    ADD CONSTRAINT "FK_86e2d4e69b27e437e0780483c76" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: quotations FK_88a5e9c0b63561bfe2a555dee7d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "FK_88a5e9c0b63561bfe2a555dee7d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: categories FK_88cea2dc9c31951d06437879b40; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: order_items FK_89dd5f9a3e63caf2e5f4ea85fac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_89dd5f9a3e63caf2e5f4ea85fac" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: purchase_requisitions FK_8b59688fc00c988c35eeb9afc8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "FK_8b59688fc00c988c35eeb9afc8f" FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: shifts FK_90413bab4120ede23bb47168777; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "FK_90413bab4120ede23bb47168777" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: payments FK_9109b53fca5cef7720aca72974d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_9109b53fca5cef7720aca72974d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_items FK_9263386c35b6b242540f9493b00; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: reviews FK_9482e9567d8dcc2bc615981ef44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: goods_received_note_items FK_95aaedc9ee5cb870d2d162c95c7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_note_items
    ADD CONSTRAINT "FK_95aaedc9ee5cb870d2d162c95c7" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: goods_received_notes FK_96be556486c8f8aa18cb4fbf523; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_96be556486c8f8aa18cb4fbf523" FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: designations FK_97884615dba807341722aa7aa4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT "FK_97884615dba807341722aa7aa4b" FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: pages FK_98ceb5433a66707b9c649503dce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "FK_98ceb5433a66707b9c649503dce" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: supplier_payments FK_99283b63c5ce97cf7a4dcc08808; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_99283b63c5ce97cf7a4dcc08808" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: coupons FK_9974c02e617aa96ddafd8404323; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "FK_9974c02e617aa96ddafd8404323" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attendance_sessions FK_99ba989ff5878f70be1e1dc7e19; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "FK_99ba989ff5878f70be1e1dc7e19" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: products FK_9a5f6868c96e0069e699f33e124; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: products FK_9c365ebf78f0e8a6d9e4827ea70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_9c365ebf78f0e8a6d9e4827ea70" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: faqs FK_9c6a424c26fe0cf898e550189ed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "FK_9c6a424c26fe0cf898e550189ed" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: interviews FK_9fe747f64e2102d4e751b2af710; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT "FK_9fe747f64e2102d4e751b2af710" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: cart_items FK_a1eb449d8def14d83cf82066f94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_a1eb449d8def14d83cf82066f94" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: ledger_entries FK_a35b71f18656ba681226b8d222d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT "FK_a35b71f18656ba681226b8d222d" FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: purchase_requisitions FK_a49ac3a8fa63fa57e48e0e3c63e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT "FK_a49ac3a8fa63fa57e48e0e3c63e" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: order_returns FK_a511b1124729b644c1c26cbb098; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "FK_a511b1124729b644c1c26cbb098" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attendance_events FK_a5de61c509b546a72581874e97d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "FK_a5de61c509b546a72581874e97d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: files FK_a7435dbb7583938d5e7d1376041; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attendance_sessions FK_a7f892c8d789419c94bfbbc4cf5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "FK_a7f892c8d789419c94bfbbc4cf5" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: fulfillment_items FK_a8af3be22257ae885240f2acd17; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_items
    ADD CONSTRAINT "FK_a8af3be22257ae885240f2acd17" FOREIGN KEY (bin_id) REFERENCES public.warehouse_bins(id);


--
-- Name: debit_notes FK_ac47fdc79dc3e75dbebef19aea7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debit_notes
    ADD CONSTRAINT "FK_ac47fdc79dc3e75dbebef19aea7" FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL;


--
-- Name: site_settings FK_ae904a1632fb292b94b7c645715; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "FK_ae904a1632fb292b94b7c645715" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: supplier_ap_ledger FK_aeeb86558911162ffe27584d62d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ap_ledger
    ADD CONSTRAINT "FK_aeeb86558911162ffe27584d62d" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_ledger FK_b002207b48235b3302382997a8e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_b002207b48235b3302382997a8e" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: suppliers FK_b0d0350059126fa08fddc3c7a46; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "FK_b0d0350059126fa08fddc3c7a46" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: supplier_payments FK_b1c9c7f6f733b3a8a3501b0cb80; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_b1c9c7f6f733b3a8a3501b0cb80" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payments FK_b2f7b823a21562eeca20e72b006; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: suppliers FK_b3aba33228acd59f2d734c31b82; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "FK_b3aba33228acd59f2d734c31b82" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: wishlists FK_b5e6331a1a7d61c25d7a25cab8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "FK_b5e6331a1a7d61c25d7a25cab8f" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items FK_b7213c20c1ecdc6597abc8f1212; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: subscribers FK_b97323410523f74139fbd6a84e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "FK_b97323410523f74139fbd6a84e0" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: performance_reviews FK_b9a0441863f21815d352c42b774; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "FK_b9a0441863f21815d352c42b774" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: pos_registers FK_ba024979f57eb3d0aba10bdf682; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_registers
    ADD CONSTRAINT "FK_ba024979f57eb3d0aba10bdf682" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: rfqs FK_bb02a5f85002c6f581dfda253f7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT "FK_bb02a5f85002c6f581dfda253f7" FOREIGN KEY (pr_id) REFERENCES public.purchase_requisitions(id) ON DELETE SET NULL;


--
-- Name: faqs FK_bb9d426714c53bfde1bb2738b6f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "FK_bb9d426714c53bfde1bb2738b6f" FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: order_returns FK_bcd8e1a275860e70f3a876d718f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "FK_bcd8e1a275860e70f3a876d718f" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: employees FK_bcdf921072a19dd2758a628c5c0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_bcdf921072a19dd2758a628c5c0" FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: interviews FK_beedda01f5a34f689c91fe10a33; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT "FK_beedda01f5a34f689c91fe10a33" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id);


--
-- Name: order_items FK_bf96e1bdbc1ce2ec1f7fe66e8c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_bf96e1bdbc1ce2ec1f7fe66e8c2" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews FK_bfb7f35d7db2b7afc40811c1925; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_bfb7f35d7db2b7afc40811c1925" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_orders FK_c13036093717212c2c6aa111c73; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_c13036093717212c2c6aa111c73" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: accounts FK_c1cce1e0d9cc2557038a7f639d7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_c1cce1e0d9cc2557038a7f639d7" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_ledger FK_c1e0ac7aaa9f72d841672ed4d71; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_c1e0ac7aaa9f72d841672ed4d71" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE SET NULL;


--
-- Name: fulfillment_items FK_c648ae7283770b2cc96b0d66c81; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_items
    ADD CONSTRAINT "FK_c648ae7283770b2cc96b0d66c81" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: goods_received_notes FK_c6afd331fea86f0200bde69c2b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT "FK_c6afd331fea86f0200bde69c2b2" FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: purchase_order_items FK_c7a528a540ba57bfc7bac43109b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_c7a528a540ba57bfc7bac43109b" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: order_returns FK_c8fafcb69df5d7aaa71e26afe57; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "FK_c8fafcb69df5d7aaa71e26afe57" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: supplier_documents FK_cbe015b8abb284bb284ef255ae6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT "FK_cbe015b8abb284bb284ef255ae6" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_documents FK_cc568f9580a76c0ca401d0ebcc8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT "FK_cc568f9580a76c0ca401d0ebcc8" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: employee_personal_details FK_cddd142f40ac341309375dc80a4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_personal_details
    ADD CONSTRAINT "FK_cddd142f40ac341309375dc80a4" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: supplier_documents FK_cf5e6cdf36a9417326cfd8e9c7a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT "FK_cf5e6cdf36a9417326cfd8e9c7a" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: job_postings FK_cf838f9c48f90ad76d0f2d231e5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT "FK_cf838f9c48f90ad76d0f2d231e5" FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: purchase_orders FK_d16a885aa88447ccfd010e739b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: warehouses FK_d1a87bf9de7503bb1b6fc0cb859; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "FK_d1a87bf9de7503bb1b6fc0cb859" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: product_prices FK_d22f25edb23158a4711f5b905b8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT "FK_d22f25edb23158a4711f5b905b8" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pos_registers FK_d2b77e27dc1654786ce5c2bcbc1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_registers
    ADD CONSTRAINT "FK_d2b77e27dc1654786ce5c2bcbc1" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: campaigns FK_d4b32d1e898a336c770e08bf5e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "FK_d4b32d1e898a336c770e08bf5e8" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items FK_d5089517fc19b1b9fb04454740c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_d5089517fc19b1b9fb04454740c" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: interviews FK_dab087b7d082364ae58637eafbb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT "FK_dab087b7d082364ae58637eafbb" FOREIGN KEY (interviewer_id) REFERENCES public.employees(id);


--
-- Name: order_items FK_db2d0ea722e16e0fe8ab3bce111; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: leave_quotas FK_dc7397712b20fd6121608ec36f7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_quotas
    ADD CONSTRAINT "FK_dc7397712b20fd6121608ec36f7" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: inventory_ledger FK_dea744012a4183aa2844456cceb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT "FK_dea744012a4183aa2844456cceb" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: attendance_events FK_e1949a8236a5c307edd9fedc77c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "FK_e1949a8236a5c307edd9fedc77c" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: site_settings FK_e3c0b0f92d46ec87d2aedb08955; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "FK_e3c0b0f92d46ec87d2aedb08955" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ledger_entries FK_e4440167e470be69f9622c1ceab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT "FK_e4440167e470be69f9622c1ceab" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: employee_personal_details FK_e664ab9994a642e82cf6a9b8cd4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_personal_details
    ADD CONSTRAINT "FK_e664ab9994a642e82cf6a9b8cd4" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: expenses FK_e86e6bebe054a040132d2aeb5bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_e86e6bebe054a040132d2aeb5bc" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_variants FK_e96e3e3799fe4b21ad07b3b3cff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "FK_e96e3e3799fe4b21ad07b3b3cff" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: invoices FK_ea83c3b911906a3578de2340fdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_ea83c3b911906a3578de2340fdf" FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: cart_items FK_ede780fc2b865d1d1323e598038; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_ede780fc2b865d1d1323e598038" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: leave_requests FK_eef6f2beeb96d468621f22e0f29; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "FK_eef6f2beeb96d468621f22e0f29" FOREIGN KEY (approved_by_id) REFERENCES public.employees(id);


--
-- Name: faqs FK_efa33cfbfffe5e5ddf10b8360ef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "FK_efa33cfbfffe5e5ddf10b8360ef" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: subscription_plans FK_f06b516e6bdc44a370ca7d69a0e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "FK_f06b516e6bdc44a370ca7d69a0e" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payroll_slips FK_f1be92cc623c24694a4bfeca341; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT "FK_f1be92cc623c24694a4bfeca341" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: product_attributes FK_f5a6700abd0494bae3032cf5bbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: fulfillment_tasks FK_f85ca1017c1901d0403ef0d4a38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_tasks
    ADD CONSTRAINT "FK_f85ca1017c1901d0403ef0d4a38" FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: promotions FK_f8bcbc3a412f82f76f493769a98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_prices FK_f9b2d233a542e7b8e46f24f5b2e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT "FK_f9b2d233a542e7b8e46f24f5b2e" FOREIGN KEY (price_book_id) REFERENCES public.price_books(id) ON DELETE CASCADE;


--
-- Name: employee_shift_assignments FK_fa37ad60710e7570a60e8100be2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shift_assignments
    ADD CONSTRAINT "FK_fa37ad60710e7570a60e8100be2" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users FK_fa43267f9de1621105d7f0fea48; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_fa43267f9de1621105d7f0fea48" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE SET NULL;


--
-- Name: branches FK_fda619979f40a6a44fc9baf02c3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "FK_fda619979f40a6a44fc9baf02c3" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: purchase_requisition_items FK_fdf77ad5e25189650a2a4f6a833; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT "FK_fdf77ad5e25189650a2a4f6a833" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict bWKpcWf2yQuAPdjEdqqiqfaJrRdJpzky5nKGvfEKtbQLX0zDVCEueUzArdVNfCQ

