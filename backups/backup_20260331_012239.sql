--
-- PostgreSQL database dump
--

\restrict VY3PUROYxE53dacLfT6u7sshTCMyEOF8jlixLPBkC2XkYXWkoJZEeKQHAGLlcvt

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


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
-- Name: inventory_transactions_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_transactions_reference_type_enum AS ENUM (
    'order',
    'purchase',
    'adjustment',
    'initial'
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
-- Name: leads_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leads_status_enum AS ENUM (
    'new',
    'contacted',
    'converted'
);


ALTER TYPE public.leads_status_enum OWNER TO postgres;

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
-- Name: orders_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_payment_method_enum AS ENUM (
    'cod',
    'sslcommerz'
);


ALTER TYPE public.orders_payment_method_enum OWNER TO postgres;

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
    'sslcommerz'
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
-- Name: products_discount_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.products_discount_type_enum AS ENUM (
    'percentage',
    'fixed',
    'free_shipping'
);


ALTER TYPE public.products_discount_type_enum OWNER TO postgres;

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
    'cancelled'
);


ALTER TYPE public.purchase_orders_status_enum OWNER TO postgres;

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
    'marketing'
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
    'marketing'
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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    user_id uuid
);


ALTER TABLE public.brands OWNER TO postgres;

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
    user_id uuid NOT NULL,
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
    user_id uuid
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
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_id uuid NOT NULL,
    variant_id uuid,
    supplier_id uuid,
    type public.inventory_transactions_type_enum NOT NULL,
    quantity integer NOT NULL,
    reference_type public.inventory_transactions_reference_type_enum NOT NULL,
    reference_id character varying(255),
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

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
    user_id uuid NOT NULL,
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
    payment_method public.orders_payment_method_enum NOT NULL,
    payment_status public.orders_payment_status_enum DEFAULT 'pending'::public.orders_payment_status_enum NOT NULL,
    transaction_id character varying(255),
    order_notes text,
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    tracking_id character varying(255),
    courier_status character varying(255),
    applied_coupon character varying(50),
    coupon_discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    delivery_zone character varying(50)
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
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku character varying(255) NOT NULL,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    images text,
    combination jsonb NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
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
    stock integer DEFAULT 0 NOT NULL,
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
    is_sale boolean DEFAULT false NOT NULL
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
    reference_number character varying(255) NOT NULL,
    supplier_id uuid NOT NULL,
    status public.purchase_orders_status_enum DEFAULT 'draft'::public.purchase_orders_status_enum NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_status public.purchase_orders_payment_status_enum DEFAULT 'pending'::public.purchase_orders_payment_status_enum NOT NULL,
    paid_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_id uuid NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255) NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    comment text NOT NULL,
    status public.reviews_status_enum DEFAULT 'pending'::public.reviews_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid NOT NULL,
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
    user_id uuid
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
    invited_by uuid
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
    user_id uuid
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
    billing_cycle public.subscription_invoices_billing_cycle_enum DEFAULT 'monthly'::public.subscription_invoices_billing_cycle_enum NOT NULL
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
    name character varying(255) NOT NULL,
    contact_name character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    tenant_id uuid NOT NULL,
    user_id uuid
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
    tenant_id uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, created_at, updated_at, deleted_at, tenant_id, user_id, action, entity, entity_id, old_value, new_value, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, created_at, updated_at, deleted_at, name, slug, description, image, website, tenant_id, user_id) FROM stdin;
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

COPY public.categories (id, created_at, updated_at, deleted_at, name, slug, description, image, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, created_at, updated_at, deleted_at, code, description, "discountType", amount, min_purchase_amount, start_date, expiry_date, usage_limit, used_count, is_active, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, created_at, updated_at, deleted_at, title, description, amount, expense_date, category, reference_number, tenant_id, user_id) FROM stdin;
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
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, created_at, updated_at, deleted_at, product_id, variant_id, supplier_id, type, quantity, reference_type, reference_id, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, created_at, updated_at, deleted_at, invoice_number, order_id, issue_date, due_date, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, created_at, updated_at, deleted_at, name, email, phone, address, subject, message, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1774867892750	InitialBaseline1774867892750
2	1774875292928	SubscriptionPlanEntityUpdate1774875292928
35	1774881224101	TrialStatusEnumUpdate1774881224101
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, created_at, updated_at, deleted_at, order_id, product_id, variant_id, snapshot, quantity, unit_price, discount_amount, tax_amount, total_amount, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: order_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_returns (id, created_at, updated_at, deleted_at, order_id, user_id, status, reason, admin_comment, refund_amount, items, tenant_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, created_at, updated_at, deleted_at, customer_name, customer_email, customer_phone, address, shipping_address_id, total_amount, shipping_fee, currency, currency_rate, status, payment_method, payment_status, transaction_id, order_notes, user_id, tenant_id, tracking_id, courier_status, applied_coupon, coupon_discount_amount, tax_amount, delivery_zone) FROM stdin;
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
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, created_at, updated_at, deleted_at, brand_name, brand_logo, support_email, hero, features, footer, user_id) FROM stdin;
3d663b86-a7c9-4130-b319-d8a832e8b61b	2026-03-30 12:27:21.617592+00	2026-03-30 12:27:21.617592+00	\N	YourSaaS		support@yoursaas.com	{"badge": "Next-Gen eCommerce Platform", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", "title": "Launch Your Store in Seconds, Not Days", "description": "The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.", "primaryBtnLink": "/create-store", "primaryBtnText": "Start Your Free Trial", "secondaryBtnLink": "#", "secondaryBtnText": "Watch Demo"}	[{"icon": "Globe", "title": "Multi-Tenant", "description": "Run separate stores for different brands or regions with isolated data."}, {"icon": "Zap", "title": "Instant Deployment", "description": "New stores are live in seconds with their own subdomain automatically."}, {"icon": "Shield", "title": "Secure Payments", "description": "Pre-integrated with SSLCommerz and more for secure transactions."}, {"icon": "BarChart3", "title": "Global Analytics", "description": "Monitor sales and customer behavior across all your stores."}, {"icon": "Users", "title": "User Management", "description": "Role-based access control for your team and store administrators."}, {"icon": "Target", "title": "SEO Optimized", "description": "Built-in SEO tools to help your products rank higher in search results."}]	{"socials": {"twitter": "#", "facebook": "#", "linkedin": "#", "instagram": "#"}, "copyright": "© 2024 YourSaaS. All rights reserved.", "description": "The ultimate multi-tenant eCommerce platform."}	\N
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, created_at, updated_at, deleted_at, name, "values", product_id, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, created_at, updated_at, deleted_at, sku, price, stock, low_stock_threshold, images, combination, product_id, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, created_at, updated_at, deleted_at, name, slug, description, short_description, price, is_review, discount_amount, discount_type, tax_rate, images, stock, low_stock_threshold, status, category_id, brand_id, landing_page_id, faq_source, faq_ids, supplier_id, tenant_id, user_id, meta_title, meta_description, og_image, is_new, is_hot, is_sale) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, created_at, updated_at, deleted_at, name, slug, description, "promotionType", value, "targetType", target_id, min_order_value, start_date, end_date, is_active, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, created_at, updated_at, deleted_at, purchase_order_id, product_id, variant_id, quantity, unit_price, user_id) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, created_at, updated_at, deleted_at, reference_number, supplier_id, status, total_amount, payment_status, paid_amount, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, created_at, updated_at, deleted_at, product_id, customer_name, customer_email, rating, comment, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_addresses (id, created_at, updated_at, deleted_at, user_id, tenant_id, label, recipient_name, phone, address, city, zone, is_default) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, created_at, updated_at, deleted_at, logo, brand_name, site_description, contact_email, contact_phone, whatsapp_phone, address, currency, currency_symbol, supported_currencies, social_links, marketing, smtp, payment, pathao_courier, steadfast_courier, shipping_config, navbar, footer, trust_badges, products_page, single_product_page, offers_page, robots_txt, tenant_id, user_id) FROM stdin;
560a3c74-fad0-4835-8902-04f8e1817ced	2026-03-30 14:21:11.328821+00	2026-03-30 14:21:11.328821+00	\N	\N	gowtam	Welcome to gowtam! Premium products and excellent service.	gowtam@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	1a43be4e-51ab-4143-bc2c-092274f0742f
\.


--
-- Data for Name: staff_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_invitations (id, created_at, updated_at, deleted_at, email, role, tenant_id, token, status, expires_at, invited_by) FROM stdin;
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, created_at, updated_at, deleted_at, email, is_active, user_id) FROM stdin;
\.


--
-- Data for Name: subscription_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_invoices (id, created_at, updated_at, deleted_at, invoice_number, tenant_id, subscription_plan_id, amount, currency, status, transaction_id, billing_date, payment_url, gateway_response, billing_cycle) FROM stdin;
9f505f8e-7b20-41e0-85a3-a853ca595831	2026-03-30 16:32:50.352484+00	2026-03-30 16:33:01.076073+00	\N	INV-1774888370350	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	144.00	BDT	completed	SUB-1774888370349	2026-03-30 16:32:50.35+00	\N	{"message": "Success from frontend"}	yearly
a02aa792-103a-40f9-b6d2-ff4a8f73d20e	2026-03-30 17:11:47.064802+00	2026-03-30 17:11:47.064802+00	\N	INV-1774890707061	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	15.00	BDT	pending	SUB-1774890707061	2026-03-30 17:11:47.061+00	\N	\N	monthly
cb464b91-2896-429f-8260-b8b31cc72339	2026-03-30 17:16:47.738738+00	2026-03-30 17:16:56.752318+00	\N	INV-1774891007734	7f8b8b58-8659-4638-af2e-587bb9e82835	edb73312-d6c4-40e8-8788-68fa7a46cc51	144.00	BDT	completed	SUB-1774891007734	2026-03-30 17:16:47.734+00	\N	{"message": "Success from frontend"}	yearly
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, created_at, updated_at, deleted_at, name, description, price, billing_cycle, features, is_active, user_id, monthly_price, yearly_price, is_popular) FROM stdin;
fd9e08e9-58f8-4987-933d-ac06fe80cb57	2026-03-30 12:36:53.857548+00	2026-03-30 12:56:02.225894+00	\N	Basic	this basic package	10.00	monthly	["10BG STOREAGTE"]	t	\N	10.00	8.00	f
edb73312-d6c4-40e8-8788-68fa7a46cc51	2026-03-30 12:38:07.741511+00	2026-03-30 12:56:16.131667+00	\N	Pro	This is Pro Yearly package	15.00	yearly	["60GP Storeage"]	t	\N	15.00	12.00	f
782a19d8-fa79-46cb-995c-9ee04653f5e4	2026-03-30 12:37:28.750246+00	2026-03-30 12:57:09.034721+00	2026-03-30 12:57:09.034721+00	Pro	This pro backage	20.00	monthly	["30BB STOREAGE"]	t	\N	0.00	0.00	f
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, created_at, updated_at, deleted_at, purchase_order_id, supplier_id, amount, payment_date, payment_method, transaction_id, note, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, created_at, updated_at, deleted_at, name, contact_name, email, phone, address, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: tenant_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_traffic (id, created_at, updated_at, deleted_at, tenant_id, date, request_count, last_updated, user_id) FROM stdin;
ffd226a6-2850-4a16-963e-5db7dde8baff	2026-03-31 01:10:13.024564+00	2026-03-31 01:10:13.024564+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-03-31	24	2026-03-31 01:13:57.075744+00	\N
8e544fe2-170e-4204-bc3c-58238c038ad3	2026-03-30 14:21:12.76081+00	2026-03-30 14:21:12.76081+00	\N	7f8b8b58-8659-4638-af2e-587bb9e82835	2026-03-30	472	2026-03-30 17:17:15.799049+00	\N
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

COPY public.users (id, created_at, updated_at, deleted_at, name, email, username, password, phone, address, image, is_admin, is_email_verified, email_verification_token, reset_password_token, reset_password_expires, role, status, refresh_token, tenant_id) FROM stdin;
1a43be4e-51ab-4143-bc2c-092274f0742f	2026-03-30 14:21:11.300199+00	2026-03-31 01:10:15.687347+00	\N	gowtam	gowtam@gmail.com	gowtam	$2b$10$d.YLb8fG6QqjeY7DR2ZGe.SzawU1k6aeBHqx4HnqGHO953n2VDyl2	\N	\N	\N	f	f	c0db54b9802b37514f25953fd6d7db2fb7bebe4158831d1752b3a7cf22834a31	\N	\N	admin	active	$2b$10$a3ARwWqfa/cF4CWp0KTTEugXX90uMONaoF.tPyIfhBEVqw2ioSdfO	7f8b8b58-8659-4638-af2e-587bb9e82835
c6bab8aa-d4bd-43dc-be9b-7a41a49a6c5d	2026-03-30 12:31:00.033196+00	2026-03-31 01:14:03.502683+00	\N	Super Admin	admin@gmail.com	admind	$2b$10$zrD.rpMESsbnnsesLq9tCeCIkF23HV2XpOO3MchoN1EWbeUda.17S	\N	\N	\N	t	f	\N	\N	\N	super_admin	active	$2b$10$/B5WTQrnuHM0q3eZnJUD0eJjBSOQhU1Syt7TPhZVbmaYH6rUwWYEW	\N
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, created_at, updated_at, deleted_at, user_id, product_id, tenant_id) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 35, true);


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


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
-- Name: faqs PK_2ddf4f2c910f8e8fa2663a67bf0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY (id);


--
-- Name: promotions PK_380cecbbe3ac11f0e5a7c452c34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY (id);


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
-- Name: order_returns PK_579752300589723ade9af5f1122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "PK_579752300589723ade9af5f1122" PRIMARY KEY (id);


--
-- Name: invoices PK_668cef7c22a427fd822cc1be3ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY (id);


--
-- Name: files PK_6c16b9093a142e0e7613b04a3d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY (id);


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
-- Name: staff_invitations PK_842e5346c92d8003bdb2140b6c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_invitations
    ADD CONSTRAINT "PK_842e5346c92d8003bdb2140b6c8" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: pages PK_8f21ed625aa34c8391d636b7d3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY (id);


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
-- Name: inventory_transactions PK_9b7144851f08f9eededde7edd42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "PK_9b7144851f08f9eededde7edd42" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: brands PK_b0c437120b624da1034a81fc561; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY (id);


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
-- Name: subscribers PK_cbe0a7a9256c826f403c0236b67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY (id);


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
-- Name: coupons PK_d7ea8864a0150183770f3e9a8cb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY (id);


--
-- Name: site_settings PK_e4290e8371a166d7e066d131f6e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY (id);


--
-- Name: purchase_order_items PK_e8b7568d25c41e3290db596b312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY (id);


--
-- Name: subscribers UQ_1a7163c08f0e57bd1c9821508b1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE (email);


--
-- Name: tenants UQ_21bb89e012fa5b58532009c1601; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "UQ_21bb89e012fa5b58532009c1601" UNIQUE (subdomain);


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
-- Name: IDX_1530a6f15d3c79d1b70be98f2b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1530a6f15d3c79d1b70be98f2b" ON public.products USING btree (brand_id);


--
-- Name: IDX_176b502c5ebd6e72cafbd9d6f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_176b502c5ebd6e72cafbd9d6f7" ON public.products USING btree (user_id);


--
-- Name: IDX_200e5746777e616b84e6c7ad63; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_200e5746777e616b84e6c7ad63" ON public.audit_logs USING btree (tenant_id, user_id);


--
-- Name: IDX_464f927ae360106b783ed0b410; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_464f927ae360106b783ed0b410" ON public.products USING btree (slug);


--
-- Name: IDX_4cc30fe1cdd5088a8e361f8af7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4cc30fe1cdd5088a8e361f8af7" ON public.audit_logs USING btree (tenant_id, entity, entity_id);


--
-- Name: IDX_52a29f8fc340e73d124af517f2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_52a29f8fc340e73d124af517f2" ON public.users USING btree (username, tenant_id);


--
-- Name: IDX_898d14750b88319b89b1ab66cd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON public.audit_logs USING btree (tenant_id, created_at);


--
-- Name: IDX_8b5bb3a42b7798ad7feff4e7d5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_8b5bb3a42b7798ad7feff4e7d5" ON public.pages USING btree (slug, tenant_id);


--
-- Name: IDX_9a5f6868c96e0069e699f33e12; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9a5f6868c96e0069e699f33e12" ON public.products USING btree (category_id);


--
-- Name: IDX_9c365ebf78f0e8a6d9e4827ea7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9c365ebf78f0e8a6d9e4827ea7" ON public.products USING btree (tenant_id);


--
-- Name: IDX_aa17633b6f91f0856429b1ed0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_aa17633b6f91f0856429b1ed0e" ON public.reviews USING btree (product_id, status);


--
-- Name: IDX_d1e5aa828aec675770f3f435bd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_d1e5aa828aec675770f3f435bd" ON public.wishlists USING btree (user_id, product_id, tenant_id);


--
-- Name: IDX_e9f4c2efab52114c4e99e28efb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_e9f4c2efab52114c4e99e28efb" ON public.users USING btree (email, tenant_id);


--
-- Name: subscribers FK_0c99e87bda40ab7c44e49e88ef8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT "FK_0c99e87bda40ab7c44e49e88ef8" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: users FK_109638590074998bb72a2f2cf08; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_items FK_145532db85752b29c57d2b7b1f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: products FK_1530a6f15d3c79d1b70be98f2be; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


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
-- Name: purchase_orders FK_237678c98436e0abb48b3060c82; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_237678c98436e0abb48b3060c82" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: leads FK_2440046dd05066e882bb68a780c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "FK_2440046dd05066e882bb68a780c" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_transactions FK_2520d97de0c9a0fbfc9b00f4c1b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


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
-- Name: carts FK_2ec1c94a977b940d85a4f498aea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items FK_30e89257a105eab7648a35c7fce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


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
-- Name: purchase_order_items FK_3f92bb44026cedfe235c8b91244; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: invoices FK_440f531f452dcc4389d201b9d4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_440f531f452dcc4389d201b9d4b" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pages FK_46e907ed4e2f32850168d175571; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "FK_46e907ed4e2f32850168d175571" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: expenses FK_49a0ca239d34e74fdc4e0625a78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders FK_527dd6efd5f3402f729c6b3e826; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_527dd6efd5f3402f729c6b3e826" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: orders FK_67b8be57fc38bda573d2a8513ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec" FOREIGN KEY (shipping_address_id) REFERENCES public.shipping_addresses(id) ON DELETE SET NULL;


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
-- Name: audit_logs FK_6f18d459490bb48923b1f40bdb7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_traffic FK_718255c609f0cf64754afc09b66; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_traffic
    ADD CONSTRAINT "FK_718255c609f0cf64754afc09b66" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews FK_728447781a30bc3fcfe5c2f1cdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: order_items FK_89dd5f9a3e63caf2e5f4ea85fac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_89dd5f9a3e63caf2e5f4ea85fac" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


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
-- Name: cart_items FK_a1eb449d8def14d83cf82066f94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_a1eb449d8def14d83cf82066f94" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_returns FK_a511b1124729b644c1c26cbb098; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_returns
    ADD CONSTRAINT "FK_a511b1124729b644c1c26cbb098" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: files FK_a7435dbb7583938d5e7d1376041; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: site_settings FK_ae904a1632fb292b94b7c645715; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "FK_ae904a1632fb292b94b7c645715" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_transactions FK_aeb0f3a59ed2fd95e1a13097eda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_aeb0f3a59ed2fd95e1a13097eda" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


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
-- Name: purchase_orders FK_d16a885aa88447ccfd010e739b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: purchase_order_items FK_d5089517fc19b1b9fb04454740c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_d5089517fc19b1b9fb04454740c" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: inventory_transactions FK_d84016219a197827a82e178881c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_d84016219a197827a82e178881c" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_items FK_db2d0ea722e16e0fe8ab3bce111; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: inventory_transactions FK_dde701f3b756ac6ad4040ecb551; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_dde701f3b756ac6ad4040ecb551" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: site_settings FK_e3c0b0f92d46ec87d2aedb08955; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT "FK_e3c0b0f92d46ec87d2aedb08955" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_transactions FK_e51672a4898b02f686769f71c2a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_e51672a4898b02f686769f71c2a" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: product_attributes FK_f5a6700abd0494bae3032cf5bbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: promotions FK_f8bcbc3a412f82f76f493769a98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VY3PUROYxE53dacLfT6u7sshTCMyEOF8jlixLPBkC2XkYXWkoJZEeKQHAGLlcvt

