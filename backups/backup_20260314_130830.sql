--
-- PostgreSQL database dump
--

\restrict g5t8wjCtMmDAkoFhxsLJBR1WaLbch8ATUfEj87mJpTWO3ieaOuNNwUVNXnpDe8w

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

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
    'fixed'
);


ALTER TYPE public.coupons_discounttype_enum OWNER TO postgres;

--
-- Name: expenses_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expenses_category_enum AS ENUM (
    'SHIPPING',
    'PACKAGING',
    'MARKETING',
    'SOFTWARE',
    'SALARIES',
    'UTILITIES',
    'MAINTENANCE',
    'OTHER'
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
    'ORDER',
    'PURCHASE',
    'ADJUSTMENT',
    'INITIAL'
);


ALTER TYPE public.inventory_transactions_reference_type_enum OWNER TO postgres;

--
-- Name: inventory_transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_transactions_type_enum AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public.inventory_transactions_type_enum OWNER TO postgres;

--
-- Name: invoices_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invoices_status_enum AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'CANCELLED'
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
    'fixed_amount',
    'free_shipping',
    'bogo'
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
    'PENDING',
    'PARTIAL',
    'PAID'
);


ALTER TYPE public.purchase_orders_payment_status_enum OWNER TO postgres;

--
-- Name: purchase_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_status_enum AS ENUM (
    'DRAFT',
    'PENDING',
    'RECEIVED',
    'CANCELLED'
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
    'archived'
);


ALTER TYPE public.tenants_status_enum OWNER TO postgres;

--
-- Name: tenants_subscription_billing_cycle_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_subscription_billing_cycle_enum AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public.tenants_subscription_billing_cycle_enum OWNER TO postgres;

--
-- Name: tenants_subscription_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenants_subscription_status_enum AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED'
);


ALTER TYPE public.tenants_subscription_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'Admin',
    'Operator',
    'User',
    'SuperAdmin'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'Active',
    'Inactive',
    'Blocked'
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
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    image character varying(500),
    website character varying(500),
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_coupon_code character varying(50)
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    image character varying(500),
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    title character varying(255) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    category public.expenses_category_enum DEFAULT 'OTHER'::public.expenses_category_enum NOT NULL,
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
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) DEFAULT 'General'::character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status public.faqs_status_enum DEFAULT 'active'::public.faqs_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    product_id uuid,
    page_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fieldname character varying NOT NULL,
    originalname character varying,
    encoding character varying,
    mimetype character varying,
    destination character varying,
    filename character varying,
    pdf_file character varying,
    path character varying,
    size integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    product_id uuid NOT NULL,
    type public.inventory_transactions_type_enum NOT NULL,
    quantity integer NOT NULL,
    reference_type public.inventory_transactions_reference_type_enum NOT NULL,
    reference_id character varying(255),
    tenant_id uuid NOT NULL,
    variant_id uuid,
    supplier_id uuid,
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
    invoice_number character varying(100) NOT NULL,
    order_id uuid NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    status public.invoices_status_enum DEFAULT 'PENDING'::public.invoices_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(50),
    address text,
    subject character varying(255),
    message text,
    status public.leads_status_enum DEFAULT 'new'::public.leads_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    snapshot jsonb,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_returns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status public.order_returns_status_enum DEFAULT 'pending'::public.order_returns_status_enum NOT NULL,
    reason text NOT NULL,
    admin_comment text,
    refund_amount numeric(10,2),
    items jsonb NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_returns OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(50) NOT NULL,
    address text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_coupon character varying(50),
    coupon_discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: page_traffic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_traffic (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL,
    path character varying NOT NULL,
    date date NOT NULL,
    request_count integer DEFAULT 0 NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.page_traffic OWNER TO postgres;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) DEFAULT ''::character varying NOT NULL,
    is_home_page boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    sections jsonb,
    meta_title character varying(255),
    meta_description text,
    typography jsonb,
    status public.pages_status_enum DEFAULT 'published'::public.pages_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid,
    transaction_id character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'BDT'::character varying NOT NULL,
    method character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    gateway_response jsonb,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    brand_name character varying,
    brand_logo character varying,
    support_email character varying,
    hero jsonb,
    features jsonb,
    footer jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    "values" text NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sku character varying(255) NOT NULL,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    images text,
    combination jsonb NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    low_stock_threshold integer DEFAULT 5 NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    short_description text,
    price numeric(10,2) NOT NULL,
    is_review boolean DEFAULT true NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    images text NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    status public.products_status_enum DEFAULT 'inactive'::public.products_status_enum NOT NULL,
    category_id uuid,
    brand_id uuid,
    landing_page_id uuid,
    faq_source character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    faq_ids text,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    supplier_id uuid,
    user_id uuid,
    low_stock_threshold integer DEFAULT 5 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255) NOT NULL,
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
    user_id uuid,
    slug character varying NOT NULL
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    purchase_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    variant_id uuid,
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
    reference_number character varying(255) NOT NULL,
    supplier_id uuid NOT NULL,
    status public.purchase_orders_status_enum DEFAULT 'DRAFT'::public.purchase_orders_status_enum NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tenant_id uuid NOT NULL,
    payment_status public.purchase_orders_payment_status_enum DEFAULT 'PENDING'::public.purchase_orders_payment_status_enum NOT NULL,
    paid_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    user_id uuid
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255) NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    comment text NOT NULL,
    status public.reviews_status_enum DEFAULT 'pending'::public.reviews_status_enum NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    navbar jsonb,
    trust_badges jsonb,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    footer jsonb
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: supplier_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    store_name character varying NOT NULL,
    subdomain character varying NOT NULL,
    custom_domain character varying,
    custom_domain_status public.tenants_custom_domain_status_enum DEFAULT 'pending'::public.tenants_custom_domain_status_enum NOT NULL,
    custom_domain_verified_at timestamp with time zone,
    status public.tenants_status_enum DEFAULT 'active'::public.tenants_status_enum NOT NULL,
    ssl_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subscription_plan_id uuid,
    subscription_billing_cycle public.tenants_subscription_billing_cycle_enum DEFAULT 'MONTHLY'::public.tenants_subscription_billing_cycle_enum NOT NULL,
    subscription_status public.tenants_subscription_status_enum DEFAULT 'ACTIVE'::public.tenants_subscription_status_enum NOT NULL,
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
    role public.users_role_enum DEFAULT 'User'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'Active'::public.users_status_enum NOT NULL,
    refresh_token character varying,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, created_at, updated_at, tenant_id, user_id, action, entity, entity_id, old_value, new_value, ip_address, user_agent) FROM stdin;
d4ae1433-44e7-4136-b049-8c8310ce728e	2026-03-12 16:54:55.991931+00	2026-03-12 16:54:55.991931+00	e70063fd-c5b4-458b-a139-6130f2515580	e8083ac4-0762-487a-b5fb-40e38599a435	CREATE	Brand	\N	\N	{"name": "Apple", "slug": "apple", "image": "", "website": "http://gowtam.localhost:3000/admin/brands", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
af1063b4-210a-4490-a936-e41d65315a3d	2026-03-12 16:55:08.780094+00	2026-03-12 16:55:08.780094+00	e70063fd-c5b4-458b-a139-6130f2515580	e8083ac4-0762-487a-b5fb-40e38599a435	CREATE	Brand	\N	\N	{"name": "Nike", "slug": "nike", "image": "", "website": "http://gowtam.localhost:3000/admin/brands", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
78c3aafa-3668-4423-afc9-fd7a59397625	2026-03-12 16:55:18.208917+00	2026-03-12 16:55:18.208917+00	e70063fd-c5b4-458b-a139-6130f2515580	e8083ac4-0762-487a-b5fb-40e38599a435	CREATE	Brand	\N	\N	{"name": "T-shirt", "slug": "t-shirt", "image": "", "website": "http://gowtam.localhost:3000/admin/brands", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
b841a6a6-da91-46ad-a144-82016a067bc6	2026-03-12 16:55:24.551575+00	2026-03-12 16:55:24.551575+00	e70063fd-c5b4-458b-a139-6130f2515580	e8083ac4-0762-487a-b5fb-40e38599a435	CREATE	Brand	\N	\N	{"name": "Nice", "slug": "nice", "image": "", "website": "http://gowtam.localhost:3000/admin/brands", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
d82353a0-7b82-4f9b-b165-71bd688c4a90	2026-03-12 16:55:31.134418+00	2026-03-12 16:55:31.134418+00	e70063fd-c5b4-458b-a139-6130f2515580	e8083ac4-0762-487a-b5fb-40e38599a435	CREATE	Brand	\N	\N	{"name": "Bad", "slug": "bad", "image": "", "website": "http://gowtam.localhost:3000/admin/brands", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, slug, description, image, website, tenant_id, created_at, updated_at, user_id) FROM stdin;
ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	Brand1	brand1			https://web.whatsapp.com/	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:55:20.987064+00	2026-03-01 12:55:20.987064+00	\N
272db4bc-76bb-427e-9d84-39a3b4e8059c	Apple	apple			http://gowtam.localhost:3000/admin/brands	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:54:55.985087+00	2026-03-12 16:54:55.985087+00	\N
ba18a43a-967a-4b05-a809-89c97f5abb11	Nike	nike			http://gowtam.localhost:3000/admin/brands	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:55:08.775218+00	2026-03-12 16:55:08.775218+00	\N
830a3146-c34f-4748-8e21-96f4a5590aca	T-shirt	t-shirt			http://gowtam.localhost:3000/admin/brands	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:55:18.202019+00	2026-03-12 16:55:18.202019+00	\N
2bfc392e-e407-4f0d-b725-9b7d9a026bee	Nice	nice			http://gowtam.localhost:3000/admin/brands	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:55:24.544418+00	2026-03-12 16:55:24.544418+00	\N
c5878159-3af0-4559-a54a-7ee309b97afb	Bad	bad			http://gowtam.localhost:3000/admin/brands	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:55:30.896876+00	2026-03-12 16:55:30.896876+00	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, variant_id, quantity, tenant_id, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, tenant_id, created_at, updated_at, applied_coupon_code) FROM stdin;
dca3ffa6-dc2a-4b49-addd-655a9125b88d	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:21.01957+00	2026-03-01 13:01:21.01957+00	\N
7cf2db8c-8aee-4ef5-af2d-2ef955a5404a	deb0d291-6e8c-4df5-970a-216d3cd5a823	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:36.943273+00	2026-03-02 16:37:36.943273+00	\N
c9c2cb27-9e2c-492b-9546-a7de548dc7c1	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:58:56.812916+00	2026-03-06 07:49:25.754595+00	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, image, tenant_id, created_at, updated_at, user_id) FROM stdin;
4d13c2cd-a72a-4b25-94d6-2fc8d1a2b786	cate	cate			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:58:46.999455+00	2026-03-01 12:58:46.999455+00	\N
3a7305b9-bd66-44da-b384-74996adca5cd	Cate-1	cate-1	asdfasdf		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:23:50.781667+00	2026-03-12 16:23:50.781667+00	\N
3da1ebc3-b228-41a3-926b-0f7db1df7419	Cate-2	cate-2	asdf		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:00.177629+00	2026-03-12 16:24:00.177629+00	\N
0a8d7c3f-3165-4d50-93b0-3156ad1e0bb8	Cate-3	cate-3	dd		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:07.382506+00	2026-03-12 16:24:07.382506+00	\N
77b812bb-467e-4f23-93c3-3b939468d9da	Cate-6	cate-6	asdf		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:15.83714+00	2026-03-12 16:24:15.83714+00	\N
ce5e902d-a48d-473f-8fd9-27227db2f644	Cate-22	cate-22			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:03.036734+00	2026-03-12 16:28:03.036734+00	\N
91029297-cd5e-4e53-9607-1460d3d42021	cate-44	cate-44			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:08.605175+00	2026-03-12 16:28:08.605175+00	\N
2f98ea96-f834-46ca-96ae-3addc27ad95b	cate-30	cate-30			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:15.219083+00	2026-03-12 16:28:15.219083+00	\N
096e7fad-a2d6-461b-a561-e221d78a09c9	cate-55	cate-55			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:34:47.205529+00	2026-03-12 16:34:47.205529+00	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, created_at, updated_at, code, description, "discountType", amount, min_purchase_amount, start_date, expiry_date, usage_limit, used_count, is_active, tenant_id, user_id) FROM stdin;
7dbd88aa-47f8-4576-aef5-75005aaa905b	2026-03-05 17:55:15.922455+00	2026-03-05 17:57:39.768388+00	W6WM53TR	summer 50% discount	fixed	100.00	0.00	2026-03-05 00:00:00	2026-03-07 00:00:00	\N	1	t	e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, created_at, updated_at, title, description, amount, expense_date, category, reference_number, tenant_id, user_id) FROM stdin;
e15de267-e6a2-4ef9-bb0d-ff2b8bc10b9c	2026-03-06 12:32:56.044561+00	2026-03-06 12:32:56.044561+00	Expense	sdafasdf	100.00	2026-03-06	OTHER	44	e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, question, answer, category, "order", status, tenant_id, product_id, page_id, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, fieldname, originalname, encoding, mimetype, destination, filename, pdf_file, path, size, created_at, updated_at, tenant_id, user_id) FROM stdin;
1854d3e2-dafa-4cc8-a70d-fe812b117327	file	screencapture-ecommerce-landing-page-ilbr-vercel-app-2026-02-15-21_16_39.png	7bit	image/png	public/uploads	1772469760957_screencapture-ecommerce-landing-page-ilbr-vercel-app-2026-02-15-21_16_39.png	\N	public/uploads/1772469760957_screencapture-ecommerce-landing-page-ilbr-vercel-app-2026-02-15-21_16_39.png	1559450	2026-03-02 16:42:40.972782+00	2026-03-02 16:42:40.972782+00	e46772b2-c511-4409-a267-55d282f1c0ef	\N
654d1933-9abe-4037-a3c2-5119b9670af0	file	gowtam.jpg	7bit	image/jpeg	public/uploads	1772363368735_gowtam.jpg	\N	public/uploads/1772363368735_gowtam.jpg	17302	2026-03-01 11:09:28.73828+00	2026-03-01 11:09:28.73828+00	e46772b2-c511-4409-a267-55d282f1c0ef	\N
9970bb25-d12a-4ecf-a998-df4ee75251ec	file	67c984ccbb2cd000519aa06a.webp	7bit	image/webp	public/uploads	1772469298708_67c984ccbb2cd000519aa06a.webp	\N	public/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp	110646	2026-03-02 16:34:58.714848+00	2026-03-02 16:34:58.714848+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
1df871c8-ee49-40f2-beb1-7890cf4ffe3f	file	imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg	7bit	image/jpeg	public/uploads	1772471380322_imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg	\N	public/uploads/1772471380322_imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg	26189	2026-03-02 17:09:40.328316+00	2026-03-02 17:09:40.328316+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
8187e758-a3b2-498e-81ba-576dfb74b67e	file	gowtam.jpg	7bit	image/jpeg	public/uploads	1772472477028_gowtam.jpg	\N	public/uploads/1772472477028_gowtam.jpg	17302	2026-03-02 17:27:57.037746+00	2026-03-02 17:27:57.037746+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, created_at, updated_at, product_id, type, quantity, reference_type, reference_id, tenant_id, variant_id, supplier_id, user_id) FROM stdin;
45b6cf19-8fc4-4d2f-a5d6-a3c6ab35d738	2026-03-04 17:44:39.216501+00	2026-03-04 17:44:39.216501+00	6049be83-338f-4f1d-a0fb-e748b77eea6c	IN	1	PURCHASE	b1ad4dbe-cbd1-4e27-9645-aea39f740918	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
9be1be56-2854-4bc7-98b6-20fd0ac6d0fc	2026-03-04 18:45:42.283464+00	2026-03-04 18:45:42.283464+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	IN	10	PURCHASE	e57e5892-31ff-4016-8a89-1f05d6fc6309	e70063fd-c5b4-458b-a139-6130f2515580	80b5fca1-5ed4-4f21-8eae-1d815126418f	2f62a619-47d3-453c-a040-994509e8d923	\N
57fc1627-b454-45d4-8c40-fc4c27af2438	2026-03-04 18:51:20.997252+00	2026-03-04 18:51:20.997252+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	IN	10	PURCHASE	7dab6627-7bbe-44b3-8f61-6c09f0291013	e70063fd-c5b4-458b-a139-6130f2515580	5179bc44-ae7e-4c4e-8745-62e018ad83e8	2f62a619-47d3-453c-a040-994509e8d923	\N
f5ee108b-e5fe-44a4-9356-91adada0ec88	2026-03-04 18:53:26.919572+00	2026-03-04 18:53:26.919572+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	OUT	10	ORDER	06d2e519-617a-40c1-bc35-9504e7ffc42e	e70063fd-c5b4-458b-a139-6130f2515580	5179bc44-ae7e-4c4e-8745-62e018ad83e8	\N	\N
433ea7fd-8a5f-4f99-886f-43938748cb48	2026-03-05 15:40:03.554856+00	2026-03-05 15:40:03.554856+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	IN	3	PURCHASE	2a38347c-37cc-4178-857f-2de233c4ab34	e70063fd-c5b4-458b-a139-6130f2515580	5179bc44-ae7e-4c4e-8745-62e018ad83e8	2f62a619-47d3-453c-a040-994509e8d923	\N
9aad745d-d1c4-463c-9cdc-d783f6d25313	2026-03-05 15:42:42.784617+00	2026-03-05 15:42:42.784617+00	6049be83-338f-4f1d-a0fb-e748b77eea6c	IN	2	PURCHASE	8f803440-73e5-49f1-94e9-9e0b4d3076b1	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
584b20b7-8b0f-45e2-8980-8716ee830eb7	2026-03-05 15:44:32.473935+00	2026-03-05 15:44:32.473935+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	IN	10	PURCHASE	6b9378ed-3393-49c6-9624-4343621967a8	e70063fd-c5b4-458b-a139-6130f2515580	80b5fca1-5ed4-4f21-8eae-1d815126418f	2f62a619-47d3-453c-a040-994509e8d923	\N
1b13c765-7c0e-4497-8ba0-994d802f5c52	2026-03-05 15:46:42.329812+00	2026-03-05 15:46:42.329812+00	25e3ab42-6ac3-4a38-b773-aca27a2a5514	OUT	10	ORDER	7d40c6f1-899d-4879-b1bc-b938478d8409	e70063fd-c5b4-458b-a139-6130f2515580	80b5fca1-5ed4-4f21-8eae-1d815126418f	\N	\N
bf438fba-99b4-4e87-8fd9-7e380b10cb0e	2026-03-05 17:59:17.294513+00	2026-03-05 17:59:17.294513+00	6049be83-338f-4f1d-a0fb-e748b77eea6c	OUT	1	ORDER	a47ba302-b6ae-46b2-894d-54179ac76c4e	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
e6369d89-8866-4c68-a3ed-8023cac09f0d	2026-03-06 12:56:48.43013+00	2026-03-06 12:56:48.43013+00	6049be83-338f-4f1d-a0fb-e748b77eea6c	OUT	2	ORDER	cda460d8-7598-42df-b4bf-780bd14c8a08	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, created_at, updated_at, invoice_number, order_id, issue_date, due_date, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, name, email, phone, address, subject, message, status, tenant_id, created_at, updated_at, user_id) FROM stdin;
8a0eed21-fe6c-429c-bfb6-6e64924ee019	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 13:51:48.195283+00	2026-03-12 13:51:48.195283+00	\N
8f95db81-f369-4a8d-aa6b-dce3f73e7e9d	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 17:08:21.552701+00	2026-03-12 17:08:21.552701+00	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1771946728047	AddTestMIgrationToReview1771946728047
3	1771949516993	FixedSpelling1771949516993
4	1771950196266	RemoverenamemigrationFromReviewEntity1771950196266
5	1772032017227	NewTableAuditLogCreate1772032017227
6	1772167025359	AuditLogTableCreate1772167025359
39	1772470436531	FileEntityTenantIdNullableTrue1772470436531
40	1772470778831	FileEntityTenantIdNullableFalse1772470778831
41	1772637364459	ProductEntityPageAndproductRelatedRemve1772637364459
42	1772644636902	InventoryTrasactionTableEntity1772644636902
43	1772646101170	SupplierEntityAdd1772646101170
44	1772647300178	InventoryTransactionVariantSupport1772647300178
45	1772649259020	AutoPurchaseIntegration1772649259020
46	1772727662347	UpdateEnityType1772727662347
47	1772732454449	CouponEntityAdd1772732454449
49	1772767194741	PromotionEnityAdd1772767194741
50	1772784704184	InvoiceEntityAdd1772784704184
83	1772786298526	ExpensesEntityAdd1772786298526
84	1772892978314	AllEnityAddedUserId1772892978314
85	1772894874641	SettingEntityNavbarAllfiledMarge1772894874641
105	1772905698024	AddSlugPromostionEntity1772905698024
110	1772898996046	SettingEntityFooterAllfiledMarge1772898996046
111	1772902237029	AddLowStockThresholdToProducts1772902237029
112	1772902281409	AddLowStockThresholdToProducts1772902281409
113	1772902342509	AddLowStockThresholdToProducts1772902342509
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, snapshot, quantity, unit_price, discount_amount, total_amount, tenant_id, created_at, updated_at, user_id) FROM stdin;
2a4473cb-9b8f-4fa6-81a9-b7a7b9357a46	cf65241e-b924-478c-ae13-a93f2bb1e6e9	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	1	1000.00	100.00	900.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:21.267963+00	2026-03-01 13:01:21.267963+00	\N
fbcf20c0-87d2-49d4-8354-b73337540460	1b9965b4-5557-4f0e-b3f4-cd9d16df1182	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	2	1000.00	100.00	1800.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:02:57.694061+00	2026-03-01 13:02:57.694061+00	\N
a973c50d-0420-4e4c-a954-c2e07ff7fbce	5eb15aa1-2327-4c12-8309-3638c4837120	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	2	659.00	10.00	1298.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04 17:50:29.035953+00	2026-03-04 17:50:38.958679+00	\N
6e320a91-7c3f-42cd-a65b-841cfd74ca65	06d2e519-617a-40c1-bc35-9504e7ffc42e	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	10	1000.00	100.00	9000.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04 18:52:42.18936+00	2026-03-04 18:52:42.18936+00	\N
728c3c6f-b9a4-49fc-b9a1-26b4b9ae66e7	7d40c6f1-899d-4879-b1bc-b938478d8409	25e3ab42-6ac3-4a38-b773-aca27a2a5514	80b5fca1-5ed4-4f21-8eae-1d815126418f	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "80b5fca1-5ed4-4f21-8eae-1d815126418f", "variantSku": "SKU-0AYXCVZ86", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "sm"}}	10	1000.00	100.00	9000.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 15:46:20.723763+00	2026-03-05 15:46:20.723763+00	\N
4b786c20-4dd2-4083-9857-7a44f4c74620	a47ba302-b6ae-46b2-894d-54179ac76c4e	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	1	659.00	10.00	649.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 17:57:39.771637+00	2026-03-05 17:59:22.892181+00	\N
c3d1a10e-5476-4120-8b74-5222a3c012f0	cda460d8-7598-42df-b4bf-780bd14c8a08	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	2	659.00	10.00	1298.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-06 12:55:10.448877+00	2026-03-06 12:56:53.251624+00	\N
\.


--
-- Data for Name: order_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_returns (id, order_id, user_id, status, reason, admin_comment, refund_amount, items, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_name, customer_email, customer_phone, address, total_amount, currency, currency_rate, status, payment_method, payment_status, transaction_id, order_notes, user_id, tenant_id, tracking_id, courier_status, created_at, updated_at, applied_coupon, coupon_discount_amount) FROM stdin;
cf65241e-b924-478c-ae13-a93f2bb1e6e9	Arkopual	Arkopual@gmail.com	01767163576	Jhikaracha,Jashore	900.00	USD	1.0000	completed	cod	paid	\N	asdfasdf	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-01 13:01:21.267963+00	2026-03-02 17:11:33.172902+00	\N	0.00
1b9965b4-5557-4f0e-b3f4-cd9d16df1182	Arkopuals	Arkopuals@gmail.com	01767163576	Jhikaracha,Jashore	1800.00	USD	1.0000	completed	cod	paid	\N	ddddd	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-01 13:02:57.694061+00	2026-03-02 17:11:41.499932+00	\N	0.00
5eb15aa1-2327-4c12-8309-3638c4837120	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	1298.00	BDT	1.0000	completed	cod	pending	\N	sdsdafasdf	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-04 17:50:29.035953+00	2026-03-04 17:50:38.958679+00	\N	0.00
06d2e519-617a-40c1-bc35-9504e7ffc42e	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	9000.00	BDT	1.0000	completed	cod	pending	\N	sss	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-04 18:52:42.18936+00	2026-03-04 18:53:26.913545+00	\N	0.00
7d40c6f1-899d-4879-b1bc-b938478d8409	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	9000.00	BDT	1.0000	completed	cod	paid	\N	dddd	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-05 15:46:20.723763+00	2026-03-05 15:46:51.196251+00	\N	0.00
a47ba302-b6ae-46b2-894d-54179ac76c4e	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	549.00	BDT	1.0000	completed	cod	paid	\N		e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-05 17:57:39.771637+00	2026-03-05 17:59:21.24004+00	W6WM53TR	100.00
cda460d8-7598-42df-b4bf-780bd14c8a08	Arkopual	Arkopual@gmail.com	01767163576	Jashore	1298.00	BDT	1.0000	completed	cod	paid	\N	asdfasdf	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-06 12:55:10.448877+00	2026-03-06 12:56:53.251624+00	\N	0.00
\.


--
-- Data for Name: page_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page_traffic (id, created_at, updated_at, tenant_id, path, date, request_count, last_updated, user_id) FROM stdin;
23b3c45d-204f-488f-8974-176d70ac4f82	2026-03-01 12:18:41.846138+00	2026-03-01 12:18:41.846138+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/products/f9412bb0-acd5-4c0f-95be-f916c8053fa9	2026-03-01	6	2026-03-01 12:49:13.291678+00	\N
d61a6b71-523c-4128-8365-d39baa35d523	2026-02-27 04:47:24.29211+00	2026-02-27 04:47:24.29211+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/users/profile	2026-02-27	4	2026-02-27 04:49:30.04478+00	\N
2dcb54b1-4374-4b9d-8aa3-03514246a8b4	2026-02-27 04:47:24.376052+00	2026-02-27 04:47:24.376052+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/orders/user/dd5d24b0-2970-4207-a90d-5c1517890e45	2026-02-27	5	2026-02-27 04:49:30.078142+00	\N
4f6e7728-7233-4568-a236-6687b28cf885	2026-02-27 04:47:24.54436+00	2026-02-27 04:47:24.54436+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/profile	2026-02-27	2	2026-02-27 04:49:30.171167+00	\N
2a0375aa-0ca2-4e2f-a183-8494b876fd2c	2026-02-27 04:46:30.746953+00	2026-02-27 04:46:30.746953+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/system-platform/tenants	2026-02-27	2	2026-02-27 04:46:34.590212+00	\N
ae222771-28ea-4ddc-85a6-ad8832497733	2026-02-27 06:20:25.551645+00	2026-02-27 06:20:25.551645+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/register	2026-02-27	1	2026-02-27 06:20:25.551645+00	\N
2b9325f0-d882-481a-bfad-e22e76da85b1	2026-02-27 06:20:55.877903+00	2026-02-27 06:20:55.877903+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/auth/register	2026-02-27	1	2026-02-27 06:20:55.877903+00	\N
be796c62-9c69-4f34-933b-5469cebb6f69	2026-02-27 04:46:37.614578+00	2026-02-27 04:46:37.614578+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/platform/settings	2026-02-27	2	2026-02-27 04:46:37.64043+00	\N
23642977-aaee-4e45-ad76-76ebd64cc5fc	2026-02-27 04:46:38.027285+00	2026-02-27 04:46:38.027285+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/system-platform/settings	2026-02-27	1	2026-02-27 04:46:38.027285+00	\N
ffe87300-c6ad-4509-92eb-0b4b50279d5e	2026-03-01 12:39:33.587848+00	2026-03-01 12:39:33.587848+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/auth/register	2026-03-01	5	2026-03-01 12:49:29.885315+00	\N
02469435-2052-4781-9802-f15325343c22	2026-03-01 12:58:56.811085+00	2026-03-01 12:58:56.811085+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-01	9	2026-03-01 13:02:44.681581+00	\N
fdbd10ab-1bfd-4605-9c4c-583450d2e4af	2026-02-27 04:47:20.236452+00	2026-02-27 04:47:20.236452+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/pages/home	2026-02-27	15	2026-02-27 04:54:32.548331+00	\N
b272aa1e-f66e-4a93-825b-896a79216b98	2026-02-27 04:47:21.51044+00	2026-02-27 04:47:21.51044+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/pages	2026-02-27	19	2026-02-27 04:54:33.718778+00	\N
6b12ddb3-b7b1-455e-b36f-f69cf7df532b	2026-02-27 04:46:22.047797+00	2026-02-27 04:46:22.047797+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/cart	2026-02-27	17	2026-02-27 04:54:33.810978+00	\N
dba4c72d-fd16-4db2-8af5-98c72cefa68d	2026-02-27 04:47:21.715766+00	2026-02-27 04:47:21.715766+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/	2026-02-27	14	2026-02-27 04:54:34.028822+00	\N
42e5b031-f013-48f5-b64b-ff878957c01d	2026-03-01 11:06:59.808312+00	2026-03-01 11:06:59.808312+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/report/analytics	2026-03-01	2	2026-03-01 11:06:59.82386+00	\N
282e90b2-979d-451f-88e0-148f6affbaf6	2026-02-27 06:24:43.199467+00	2026-02-27 06:24:43.199467+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/pages/home	2026-02-27	3	2026-02-27 16:11:27.94986+00	\N
ad286b36-4118-409a-b6fd-3a31d0a5671a	2026-02-27 04:45:22.603192+00	2026-02-27 04:45:22.603192+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/tenants	2026-02-27	4	2026-02-27 04:48:17.174665+00	\N
c794eff6-0338-44a9-8a53-c435d040ea19	2026-02-27 04:45:22.620453+00	2026-02-27 04:45:22.620453+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/admin/login	2026-02-27	4	2026-02-27 04:48:17.186667+00	\N
11d3a10d-6386-449d-8b17-c40c71a50eea	2026-02-27 04:45:09.200081+00	2026-02-27 04:45:09.200081+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/tracking/page-view	2026-02-27	27	2026-02-27 04:54:59.942346+00	\N
7b8a5548-ff20-4b7f-9b26-e80ef21805cf	2026-02-27 04:45:09.20019+00	2026-02-27 04:45:09.20019+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/login	2026-02-27	4	2026-02-27 04:54:59.942395+00	\N
8703db55-85ea-482d-97eb-0b85f3a0f5c6	2026-02-27 04:46:23.936414+00	2026-02-27 04:46:23.936414+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/system-platform	2026-02-27	4	2026-02-27 04:48:18.212833+00	\N
c53f59d3-f34e-4f6c-982c-ac8432849c3e	2026-02-27 04:45:08.02566+00	2026-02-27 04:45:08.02566+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	/api/v1/settings	2026-02-27	12	2026-02-27 06:10:12.219921+00	\N
81ee7767-5cfc-4130-8d65-14f455cfddda	2026-02-27 06:10:49.523462+00	2026-02-27 06:10:49.523462+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/settings	2026-02-27	8	2026-02-27 16:11:28.023113+00	\N
179aa18d-ad2a-49fa-bece-9d26f8a961af	2026-02-27 06:24:43.704767+00	2026-02-27 06:24:43.704767+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/pages	2026-02-27	2	2026-02-27 16:11:29.262786+00	\N
e9bbfaf3-c9f1-4310-83a9-551655787abf	2026-02-27 06:24:44.073788+00	2026-02-27 06:24:44.073788+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/	2026-02-27	2	2026-02-27 16:11:29.507923+00	\N
d79b482b-37bc-4d21-a651-8bf68a6587ee	2026-03-01 11:06:28.828845+00	2026-03-01 11:06:28.828845+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/pages	2026-03-01	66	2026-03-01 12:49:15.256243+00	\N
e72b49b3-140a-4699-a966-9941b6f4f1bc	2026-02-27 06:10:27.77471+00	2026-02-27 06:10:27.77471+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/tenants	2026-02-27	2	2026-02-27 16:11:47.468298+00	\N
fd70e7d1-7527-4f72-a953-cce1e756b5d5	2026-02-27 06:10:27.785883+00	2026-02-27 06:10:27.785883+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/admin/login	2026-02-27	2	2026-02-27 16:11:47.478898+00	\N
29bb9c1b-2909-4b87-86c9-66c64bfa0511	2026-02-27 06:10:27.981206+00	2026-02-27 06:10:27.981206+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/cart	2026-02-27	2	2026-02-27 16:11:47.669507+00	\N
c5bb5f0f-1e11-4fbd-824d-658189c9d2d7	2026-02-27 06:11:05.704586+00	2026-02-27 06:11:05.704586+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/tenants/info	2026-02-27	2	2026-02-27 06:11:05.724526+00	\N
2b0ada32-cada-4b1d-8eae-26d316a6a0a8	2026-03-01 11:23:03.467368+00	2026-03-01 11:23:03.467368+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/orders/51cc746a-af2c-48d2-9e5f-fbfa0e6e9c15	2026-03-01	5	2026-03-01 11:23:16.469366+00	\N
9bc32854-2704-48d0-b3d8-e310114f91dd	2026-03-01 12:58:37.573587+00	2026-03-01 12:58:37.573587+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-01	6	2026-03-01 13:00:02.322885+00	\N
36b12e9c-6f31-4e49-a0a0-7a972edc9ff0	2026-03-01 11:06:40.477624+00	2026-03-01 11:06:40.477624+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/admin/login	2026-03-01	7	2026-03-01 12:52:17.730878+00	\N
21ec26b5-026a-4b3d-bc62-5d558d00f1f6	2026-02-27 06:11:15.396282+00	2026-02-27 06:11:15.396282+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/report/analytics	2026-02-27	4	2026-02-27 16:11:57.476132+00	\N
237037d2-88dc-4ad7-b358-ca4d8a768e89	2026-03-01 11:12:33.532128+00	2026-03-01 11:12:33.532128+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/cart/sync	2026-03-01	11	2026-03-01 12:49:30.268677+00	\N
61a4a7a6-8a9d-4006-b895-7bfdbc541179	2026-02-27 06:10:31.711848+00	2026-02-27 06:10:31.711848+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/report/dashboard	2026-02-27	18	2026-02-27 16:12:13.680076+00	\N
304943bc-393a-48d4-8f72-d5f13b0fb557	2026-02-27 06:10:13.468962+00	2026-02-27 06:10:13.468962+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/login	2026-02-27	5	2026-02-27 16:12:24.209944+00	\N
38e239e3-cb83-4220-851c-e5c50b75f810	2026-02-27 06:10:13.468905+00	2026-02-27 06:10:13.468905+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/tracking/page-view	2026-02-27	8	2026-02-27 16:12:24.210098+00	\N
a96e5020-79d1-40f7-b546-d175f54ce452	2026-03-01 11:06:44.135433+00	2026-03-01 11:06:44.135433+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/report/dashboard	2026-03-01	10	2026-03-01 12:54:33.960408+00	\N
71f4d7ce-267b-4774-bbe0-c81a3fc534e8	2026-03-01 11:11:19.648136+00	2026-03-01 11:11:19.648136+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/pages/e5939a5c-29b9-451a-92d2-365e38e99054	2026-03-01	3	2026-03-01 11:11:37.411212+00	\N
3d8ccd94-b274-40b1-8f38-a87b690bef37	2026-03-01 11:06:28.223366+00	2026-03-01 11:06:28.223366+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/settings	2026-03-01	9	2026-03-01 12:57:15.282599+00	\N
ada6c414-62d3-468d-862c-bf11269491e1	2026-03-01 11:07:13.156545+00	2026-03-01 11:07:13.156545+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/categories	2026-03-01	22	2026-03-01 12:56:13.072903+00	\N
739ff7a9-99c1-4dd8-bba9-d4c348845f34	2026-03-01 11:12:12.851767+00	2026-03-01 11:12:12.851767+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/checkout	2026-03-01	10	2026-03-01 12:49:15.562058+00	\N
ae4bd356-d258-423d-8d5b-9532e480967f	2026-03-01 11:07:13.183695+00	2026-03-01 11:07:13.183695+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/brands	2026-03-01	23	2026-03-01 12:57:15.684841+00	\N
9b01ee9c-1401-4aed-b72a-2e258a182dc4	2026-03-01 11:10:34.623333+00	2026-03-01 11:10:34.623333+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/reviews/public	2026-03-01	2	2026-03-01 11:10:34.757793+00	\N
6fbf2cb8-a429-4669-9b64-6983752dd1ac	2026-03-01 11:09:25.406733+00	2026-03-01 11:09:25.406733+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/admin/media	2026-03-01	4	2026-03-01 11:09:28.795438+00	\N
7ae997c9-4db2-42b4-b612-38d6dd2f9de9	2026-03-01 12:40:18.584243+00	2026-03-01 12:40:18.584243+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/orders/user/b4e14f57-eb6d-4ecd-b9b5-90958a07b51c	2026-03-01	2	2026-03-01 12:40:18.720297+00	\N
891f2995-aa3f-4c85-84c4-18f9e6b8e567	2026-03-01 11:12:33.592702+00	2026-03-01 11:12:33.592702+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/orders	2026-03-01	17	2026-03-01 12:52:05.923553+00	\N
5f9bd47c-a231-4652-8877-aff4af3bdffd	2026-03-01 11:07:13.129045+00	2026-03-01 11:07:13.129045+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/faqs	2026-03-01	28	2026-03-01 12:54:38.113531+00	\N
8a33fac2-5672-47da-adb6-4d82f05ac588	2026-03-01 11:12:07.597522+00	2026-03-01 11:12:07.597522+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/cart/items	2026-03-01	2	2026-03-01 12:02:22.139538+00	\N
a5ba3137-5b64-4bea-b313-470dee59b3a6	2026-03-01 11:06:40.465739+00	2026-03-01 11:06:40.465739+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/tenants	2026-03-01	9	2026-03-01 12:54:33.570606+00	\N
50a6de67-bce2-40a4-9aef-646df9cff237	2026-03-01 12:40:18.510815+00	2026-03-01 12:40:18.510815+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/users/profile	2026-03-01	2	2026-03-01 12:40:18.706054+00	\N
004d9660-95f3-4356-8513-952b82f1c50e	2026-03-01 11:06:28.16565+00	2026-03-01 11:06:28.16565+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/pages/home	2026-03-01	17	2026-03-01 12:49:06.8584+00	\N
b22a25d1-c647-49ee-953a-26875192d0a1	2026-03-01 11:06:29.216954+00	2026-03-01 11:06:29.216954+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/tracking/page-view	2026-03-01	46	2026-03-01 12:54:13.786634+00	\N
8d4c853f-fd1b-4a84-a239-eb59d070a4e9	2026-03-01 11:06:40.641115+00	2026-03-01 11:06:40.641115+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/cart	2026-03-01	34	2026-03-01 12:57:15.675581+00	\N
a09accc5-a923-436e-b311-3d576f6ae1a6	2026-03-01 11:07:08.853158+00	2026-03-01 11:07:08.853158+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/products	2026-03-01	55	2026-03-01 12:58:36.762616+00	\N
b047d2e6-a4de-4d68-ba74-d4fbb7cc2366	2026-03-01 11:06:29.217048+00	2026-03-01 11:06:29.217048+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/	2026-03-01	16	2026-03-01 12:49:08.198818+00	\N
297ffff1-1929-4f95-be54-c6784f606676	2026-03-01 12:40:18.800154+00	2026-03-01 12:40:18.800154+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/profile	2026-03-01	1	2026-03-01 12:40:18.800154+00	\N
d4a53c99-a09a-40a3-b5ec-633ed8dbf48a	2026-03-01 11:11:46.897941+00	2026-03-01 11:11:46.897941+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/api/v1/products/slug/new-product-for-test	2026-03-01	10	2026-03-01 12:49:11.293912+00	\N
47aa9c07-44e2-4557-8b9f-a8ca17165d35	2026-03-01 11:11:47.695787+00	2026-03-01 11:11:47.695787+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/products/new-product-for-test	2026-03-01	10	2026-03-01 12:49:12.228217+00	\N
dfae3b03-0d96-4916-8546-50b91ee8ff59	2026-03-01 11:06:32.783492+00	2026-03-01 11:06:32.783492+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	/login	2026-03-01	9	2026-03-01 12:54:13.786469+00	\N
f7bebfac-5125-41a3-87a0-4476c8902f74	2026-03-01 12:58:36.772114+00	2026-03-01 12:58:36.772114+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-01	25	2026-03-01 13:03:00.863721+00	\N
1019e14f-866c-42ac-9b75-5ebf5a9e2240	2026-03-01 12:54:28.803415+00	2026-03-01 12:54:28.803415+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-01	3	2026-03-01 13:01:20.741506+00	\N
a4a7cb96-3542-459d-aca9-a6f73836c234	2026-03-01 12:58:56.11747+00	2026-03-01 12:58:56.11747+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-01	1	2026-03-01 12:58:56.11747+00	\N
eadbf0fc-d7e9-4d03-9833-0388ca7586db	2026-03-01 12:58:56.736408+00	2026-03-01 12:58:56.736408+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-01	8	2026-03-01 13:02:40.243601+00	\N
1ffbb11c-7f03-4814-9dea-d75c91f2c980	2026-03-01 13:01:21.014445+00	2026-03-01 13:01:21.014445+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/sync	2026-03-01	2	2026-03-01 13:02:57.60283+00	\N
0e62ea92-9cee-4320-8f8c-2143f38a5677	2026-03-01 13:01:21.22243+00	2026-03-01 13:01:21.22243+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-01	2	2026-03-01 13:02:57.678601+00	\N
4a40ee8a-f645-49a1-8f3a-5c6d4a102dea	2026-03-01 12:59:14.870698+00	2026-03-01 12:59:14.870698+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-01	4	2026-03-01 12:59:20.846373+00	\N
43f97806-196c-466e-a108-35e7296f1199	2026-03-01 12:59:54.150884+00	2026-03-01 12:59:54.150884+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-01	6	2026-03-01 13:03:00.58928+00	\N
72440555-a609-4f3d-b496-8bdc29c49814	2026-03-02 17:06:35.206003+00	2026-03-02 17:06:35.206003+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/report/analytics	2026-03-02	2	2026-03-02 17:06:35.224472+00	\N
0c3ed783-5e3b-4811-899d-fb02dc5fc1d5	2026-03-01 12:58:40.164405+00	2026-03-01 12:58:40.164405+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-01	8	2026-03-01 13:00:02.030788+00	\N
4fcb242d-5956-48d2-9a2b-7f1e04f8d0c1	2026-03-01 13:00:01.917155+00	2026-03-01 13:00:01.917155+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-01	2	2026-03-01 13:00:02.062279+00	\N
ab64ca24-da20-42de-bf9d-db5138c78bc7	2026-03-01 12:59:55.057564+00	2026-03-01 12:59:55.057564+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-01	11	2026-03-01 13:03:01.167658+00	\N
49f31579-1f93-48e6-b4a0-e46ab45830e3	2026-03-01 12:59:55.05761+00	2026-03-01 12:59:55.05761+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-01	6	2026-03-01 13:03:01.167705+00	\N
3bda5a0f-59a8-472a-adb9-d175aaf065b7	2026-03-01 13:00:04.915314+00	2026-03-01 13:00:04.915314+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/162f10a5-9e0e-42c2-9bf2-1ea2474149f4	2026-03-01	3	2026-03-01 13:00:14.393502+00	\N
f7c01daa-ac0e-419e-b1d6-def848d63a01	2026-03-01 12:59:54.654649+00	2026-03-01 12:59:54.654649+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-01	22	2026-03-01 13:03:31.141309+00	\N
d4c419d4-369d-4585-b3d1-0487d13cad6b	2026-03-01 13:00:49.447551+00	2026-03-01 13:00:49.447551+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-01	1	2026-03-01 13:00:49.447551+00	\N
be37b71d-e28f-4e4a-a42d-1e0c085854de	2026-03-02 17:09:04.657559+00	2026-03-02 17:09:04.657559+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c/reviews	2026-03-02	2	2026-03-02 17:09:04.703684+00	\N
fdf1e7de-b6af-4af3-9571-60b96a20d83d	2026-03-02 17:07:00.129195+00	2026-03-02 17:07:00.129195+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/leads	2026-03-02	2	2026-03-02 17:07:00.140916+00	\N
abad1b70-328d-4f31-9232-830157426e9f	2026-03-02 16:32:18.319809+00	2026-03-02 16:32:18.319809+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-02	40	2026-03-02 17:30:29.037374+00	\N
ae317d14-5904-4591-bd38-84721404b288	2026-03-01 13:00:58.127708+00	2026-03-01 13:00:58.127708+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514	2026-03-01	1	2026-03-01 13:00:58.127708+00	\N
f91dc2cb-fe99-4dd1-9d3f-4e0b222d533c	2026-03-02 17:11:00.315889+00	2026-03-02 17:11:00.315889+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-02	12	2026-03-02 17:25:31.014395+00	\N
d1992226-b3c2-4749-954a-efca2081b5ec	2026-03-02 17:10:50.281776+00	2026-03-02 17:10:50.281776+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-02	2	2026-03-02 17:10:50.293386+00	\N
d00c719d-9f71-4376-8761-e1d28b1ef965	2026-03-01 13:01:20.58878+00	2026-03-01 13:01:20.58878+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/auth/register	2026-03-01	1	2026-03-01 13:01:20.58878+00	\N
18a3ee44-5a3e-45f4-bde0-de780e3fd615	2026-03-01 13:01:20.73401+00	2026-03-01 13:01:20.73401+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-01	1	2026-03-01 13:01:20.73401+00	\N
f30f6902-74e0-47bf-8fe4-706bcc7eee8a	2026-03-02 17:06:39.360785+00	2026-03-02 17:06:39.360785+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/products	2026-03-02	2	2026-03-02 17:06:39.375075+00	\N
80c12826-e466-4979-8db1-88ab143c999f	2026-03-02 17:07:01.483848+00	2026-03-02 17:07:01.483848+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/returns	2026-03-02	2	2026-03-02 17:07:01.498961+00	\N
0fbc5835-1dc0-494b-9677-65124037cfdb	2026-03-02 17:06:38.422648+00	2026-03-02 17:06:38.422648+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/orders	2026-03-02	4	2026-03-02 17:06:41.220843+00	\N
351114a2-8a52-42d0-8198-2488b392d971	2026-03-01 13:00:55.051911+00	2026-03-01 13:00:55.051911+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/new-product-test	2026-03-01	2	2026-03-01 13:02:39.675461+00	\N
07775ea2-353d-4661-a924-20b0bbfbcea3	2026-03-02 17:09:04.633258+00	2026-03-02 17:09:04.633258+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-02	5	2026-03-02 17:09:51.267932+00	\N
d389c8af-b3d0-4f1b-9cff-c9bffc4be130	2026-03-02 17:06:44.535906+00	2026-03-02 17:06:44.535906+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/brands	2026-03-02	2	2026-03-02 17:06:44.551378+00	\N
7d422b52-a1d8-4207-94fb-35a062d47953	2026-03-01 13:00:55.982351+00	2026-03-01 13:00:55.982351+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/new-product-test	2026-03-01	2	2026-03-01 13:02:40.293118+00	\N
6385dd52-5184-4711-a8eb-44fb1cca356d	2026-03-01 13:02:41.539937+00	2026-03-01 13:02:41.539937+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-01	1	2026-03-01 13:02:41.539937+00	\N
db4986a7-5e96-4943-996b-dd0dac7161dc	2026-03-01 13:02:44.591016+00	2026-03-01 13:02:44.591016+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/354f4c27-3a34-4041-912c-f0478f75ef21	2026-03-01	1	2026-03-01 13:02:44.591016+00	\N
a2c382ec-d16f-4a19-9e1a-7940bad8e74c	2026-03-01 13:01:00.407984+00	2026-03-01 13:01:00.407984+00	e70063fd-c5b4-458b-a139-6130f2515580	/checkout	2026-03-01	2	2026-03-01 13:02:46.594993+00	\N
f31b74ab-2b4a-4a55-9187-65512772f33c	2026-03-02 17:06:45.634986+00	2026-03-02 17:06:45.634986+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/categories	2026-03-02	2	2026-03-02 17:06:45.644986+00	\N
4140c9d6-da7a-44ca-a53b-6878fb439857	2026-03-02 17:08:43.835736+00	2026-03-02 17:08:43.835736+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-02	2	2026-03-02 17:08:43.849094+00	\N
4c093ee1-d634-4ec7-b3c3-5d353b3cc485	2026-03-02 16:32:18.182746+00	2026-03-02 16:32:18.182746+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-02	91	2026-03-02 17:31:10.2305+00	\N
595734b8-cd33-4591-a170-dea4a1ddb7ec	2026-03-02 17:10:42.55296+00	2026-03-02 17:10:42.55296+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-02	2	2026-03-02 17:10:42.589663+00	\N
f43f4c98-7cd5-4354-bf8b-85ea89c5e007	2026-03-02 16:37:28.90097+00	2026-03-02 16:37:28.90097+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/tracking/page-view	2026-03-02	1	2026-03-02 16:37:28.90097+00	\N
fb71febe-533b-4ff2-945e-b64ce0b81854	2026-03-02 16:37:28.901013+00	2026-03-02 16:37:28.901013+00	e46772b2-c511-4409-a267-55d282f1c0ef	/login	2026-03-02	1	2026-03-02 16:37:28.901013+00	\N
ac9c91bf-78ac-457a-867c-2bf448690e70	2026-03-02 16:37:36.737754+00	2026-03-02 16:37:36.737754+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/tenants	2026-03-02	1	2026-03-02 16:37:36.737754+00	\N
ca5bd150-6a97-44e2-bf41-ea2180ff593e	2026-03-02 16:37:36.746751+00	2026-03-02 16:37:36.746751+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/admin/login	2026-03-02	1	2026-03-02 16:37:36.746751+00	\N
53da69b3-40d7-4d0d-b7ca-28e112f60da2	2026-03-02 17:06:47.353639+00	2026-03-02 17:06:47.353639+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/users	2026-03-02	2	2026-03-02 17:06:47.367096+00	\N
a776d5bb-498f-4636-9969-6f5d499c5094	2026-03-02 16:37:36.938674+00	2026-03-02 16:37:36.938674+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/cart	2026-03-02	5	2026-03-02 17:03:10.487279+00	\N
8fd88e93-5de3-4c88-b651-63b49f384905	2026-03-02 17:05:48.72065+00	2026-03-02 17:05:48.72065+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/admin/media/ffa5825c-d4ea-47eb-927c-fd40b0388191	2026-03-02	1	2026-03-02 17:05:48.72065+00	\N
9c44a37a-f09f-433b-b69e-d4b0fef30ad0	2026-03-02 16:32:18.38704+00	2026-03-02 16:32:18.38704+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-02	59	2026-03-02 17:31:21.286965+00	\N
338be1df-c0e9-485a-b892-abb450cdd39f	2026-03-02 17:06:51.479724+00	2026-03-02 17:06:51.479724+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/payments	2026-03-02	2	2026-03-02 17:06:51.493587+00	\N
a96dd589-a7db-4b63-8217-a7009e9918e1	2026-03-02 17:10:45.071514+00	2026-03-02 17:10:45.071514+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payments	2026-03-02	2	2026-03-02 17:10:45.083745+00	\N
83ba7df9-d283-432e-92b8-527771b44502	2026-03-02 17:11:18.214738+00	2026-03-02 17:11:18.214738+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/cf65241e-b924-478c-ae13-a93f2bb1e6e9	2026-03-02	6	2026-03-02 17:11:33.156217+00	\N
ddeccdc9-9000-494f-ac2e-8fba7031e886	2026-03-02 17:06:36.718055+00	2026-03-02 17:06:36.718055+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/pages	2026-03-02	4	2026-03-02 17:06:54.596278+00	\N
23d84818-60ce-41b2-b657-d6fff5748026	2026-03-02 17:06:58.534904+00	2026-03-02 17:06:58.534904+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/faqs	2026-03-02	2	2026-03-02 17:06:58.544582+00	\N
1ac010f3-8776-404a-912e-48e84cf815fa	2026-03-02 16:37:39.751214+00	2026-03-02 16:37:39.751214+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/admin/media	2026-03-02	15	2026-03-02 17:07:03.144502+00	\N
e1c0766e-434e-4c80-8e36-d8cd85ed76c7	2026-03-02 16:37:27.9433+00	2026-03-02 16:37:27.9433+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/settings	2026-03-02	5	2026-03-02 17:07:11.881712+00	\N
8907b891-f099-4f5d-86ba-fa58731195ce	2026-03-02 16:37:37.077237+00	2026-03-02 16:37:37.077237+00	e46772b2-c511-4409-a267-55d282f1c0ef	/api/v1/report/dashboard	2026-03-02	6	2026-03-02 17:07:17.664927+00	\N
81e48eab-91b2-469d-b4d5-64316a7d9c5c	2026-03-02 16:33:13.903407+00	2026-03-02 16:33:13.903407+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-02	13	2026-03-02 17:30:29.032932+00	\N
ffb67a85-c900-4046-b03d-ba94d04ac899	2026-03-02 16:32:17.211267+00	2026-03-02 16:32:17.211267+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-02	45	2026-03-02 17:31:09.847281+00	\N
3644c5f6-0a67-4aca-9fbe-31dce22e0c28	2026-03-02 16:32:17.31534+00	2026-03-02 16:32:17.31534+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-02	53	2026-03-02 17:31:14.53757+00	\N
b016d8de-f4d6-4c86-a901-394ee07a962e	2026-03-02 17:10:49.226764+00	2026-03-02 17:10:49.226764+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/returns	2026-03-02	2	2026-03-02 17:10:49.237985+00	\N
7d3987b1-cc0d-4f13-be23-1b9186df5f0b	2026-03-02 16:32:18.288921+00	2026-03-02 16:32:18.288921+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-02	86	2026-03-02 17:31:10.244007+00	\N
2664dc1e-a700-4990-82c0-fded50b11d41	2026-03-02 17:11:10.284045+00	2026-03-02 17:11:10.284045+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/1b9965b4-5557-4f0e-b3f4-cd9d16df1182	2026-03-02	6	2026-03-02 17:11:41.485141+00	\N
e9552320-9fc7-47f1-93d6-bd8b683046a8	2026-03-02 17:16:44.063731+00	2026-03-02 17:16:44.063731+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-02	11	2026-03-02 17:28:51.504295+00	\N
9f5c95d8-bebb-4efe-9414-b12235729e3e	2026-03-02 17:10:05.847749+00	2026-03-02 17:10:05.847749+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-02	4	2026-03-02 17:30:27.822024+00	\N
2432d6a8-588d-43ab-a7f1-a51c6f723bb3	2026-03-02 16:32:25.135876+00	2026-03-02 16:32:25.135876+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-02	28	2026-03-02 17:31:02.402095+00	\N
9e141040-640c-4df7-9550-2288bd98afee	2026-03-02 16:32:18.387131+00	2026-03-02 16:32:18.387131+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-02	38	2026-03-02 17:31:10.492366+00	\N
102e3bd3-541b-4794-914f-7870ea4fd9d2	2026-03-02 17:10:06.668411+00	2026-03-02 17:10:06.668411+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-02	4	2026-03-02 17:30:29.141059+00	\N
83eecd33-e653-49c0-b903-5f24bec4f4b2	2026-03-02 16:34:54.967914+00	2026-03-02 16:34:54.967914+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-02	13	2026-03-02 17:27:57.037573+00	\N
36b9fb19-f867-4ce5-b183-dca0de1e911e	2026-03-02 16:33:13.940484+00	2026-03-02 16:33:13.940484+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-02	25	2026-03-02 17:29:28.906967+00	\N
cd90a970-fc6b-42ff-82c8-0aee720e1395	2026-03-02 16:33:13.916371+00	2026-03-02 16:33:13.916371+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-02	25	2026-03-02 17:29:28.907208+00	\N
370cb103-9718-49a2-8125-c521ea731fe7	2026-03-04 16:45:17.65741+00	2026-03-04 16:45:17.65741+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-04	20	2026-03-04 18:52:53.537729+00	\N
c909162f-fb41-4314-b42e-bfd8c1db8fdc	2026-03-04 15:43:17.398498+00	2026-03-04 15:43:17.398498+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514/reviews	2026-03-04	14	2026-03-04 18:53:40.249643+00	\N
ce3b839b-dc92-497e-985f-9d4a622e14ed	2026-03-04 12:43:24.982929+00	2026-03-04 12:43:24.982929+00	e70063fd-c5b4-458b-a139-6130f2515580	/doc	2026-03-04	1	2026-03-04 12:43:24.982929+00	\N
e708bc99-a8a0-485c-bc51-8e26fe5c2053	2026-03-02 17:22:00.921438+00	2026-03-02 17:22:00.921438+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants/info	2026-03-02	2	2026-03-02 17:22:00.955476+00	\N
21240d4d-2723-49a8-ad0f-c4ccc92f1eb9	2026-03-04 15:28:59.078614+00	2026-03-04 15:28:59.078614+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-04	6	2026-03-04 18:52:34.766961+00	\N
396d98a9-3592-4ea8-a81b-8cb3acf87534	2026-03-04 15:44:03.358449+00	2026-03-04 15:44:03.358449+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/14942467-ebc7-454a-b113-d8212187fb0a	2026-03-04	4	2026-03-04 15:44:58.313932+00	\N
c4ee8a27-1c50-409e-8942-8a7eea8cf195	2026-03-04 12:42:46.372082+00	2026-03-04 12:42:46.372082+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-04	221	2026-03-04 18:53:36.734868+00	\N
79c6ab2e-dfdb-4af9-a2eb-26a722fd8a40	2026-03-04 15:46:35.234545+00	2026-03-04 15:46:35.234545+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants/info	2026-03-04	4	2026-03-04 15:46:40.030233+00	\N
50702828-f188-465d-8024-23ed32866c0d	2026-03-02 17:28:05.649484+00	2026-03-02 17:28:05.649484+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-02	1	2026-03-02 17:28:05.649484+00	\N
0bb8a662-d3b9-4b2b-9730-0f247dd21aa7	2026-03-04 12:50:31.347965+00	2026-03-04 12:50:31.347965+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-04	105	2026-03-04 19:05:34.765388+00	\N
1a969443-eedd-4cbe-a5e4-e0efe955e62b	2026-03-04 15:38:57.411007+00	2026-03-04 15:38:57.411007+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-04	2	2026-03-04 15:38:57.518982+00	\N
56c69b57-bcda-44ea-81a4-308766e7d71a	2026-03-04 15:02:42.768181+00	2026-03-04 15:02:42.768181+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-5537	2026-03-04	1	2026-03-04 15:02:42.768181+00	\N
d4ddedd3-a662-4bdc-9569-15c0297f86da	2026-03-04 12:42:45.713868+00	2026-03-04 12:42:45.713868+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-04	56	2026-03-04 19:05:46.928222+00	\N
f7bca4cf-b883-4ff2-aed5-dcff6cdfa857	2026-03-04 15:38:57.724448+00	2026-03-04 15:38:57.724448+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-04	1	2026-03-04 15:38:57.724448+00	\N
2173e426-47bb-40e4-9b06-4e25aea95371	2026-03-04 12:44:17.379852+00	2026-03-04 12:44:17.379852+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-04	32	2026-03-04 17:49:58.342858+00	\N
ea617d92-3042-4fc3-8e34-44f7f42e0773	2026-03-02 17:28:45.72102+00	2026-03-02 17:28:45.72102+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-02	1	2026-03-02 17:28:45.72102+00	\N
b6e3c07c-9370-4b49-8964-ae066d180741	2026-03-02 17:28:45.730543+00	2026-03-02 17:28:45.730543+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-02	1	2026-03-02 17:28:45.730543+00	\N
0e98c83c-fc0c-47c6-b189-776f2fe0eb92	2026-03-02 17:16:44.110318+00	2026-03-02 17:16:44.110318+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-02	19	2026-03-02 17:28:51.523146+00	\N
44585382-4c4a-47ab-ba18-7cb62af47114	2026-03-02 17:16:44.319186+00	2026-03-02 17:16:44.319186+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-02	5	2026-03-02 17:28:51.708003+00	\N
74008499-22d7-446a-9aa8-5871f28a72cc	2026-03-02 17:27:33.588419+00	2026-03-02 17:27:33.588419+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/contact	2026-03-02	2	2026-03-02 17:29:29.597406+00	\N
6225597f-b321-4bc1-9296-eb52e9dce364	2026-03-04 15:02:43.83625+00	2026-03-04 15:02:43.83625+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-5537	2026-03-04	1	2026-03-04 15:02:43.83625+00	\N
98a8f09a-beb5-44f2-aac2-111f70b3945f	2026-03-02 17:27:34.417216+00	2026-03-02 17:27:34.417216+00	e70063fd-c5b4-458b-a139-6130f2515580	/contact	2026-03-02	2	2026-03-02 17:29:30.458156+00	\N
43556faa-5a39-4851-9a9d-4aed9bbf9557	2026-03-02 17:20:21.236082+00	2026-03-02 17:20:21.236082+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-02	6	2026-03-02 17:29:32.200277+00	\N
e6574bac-681d-4b3c-9ee1-8a6fdbb8ea3c	2026-03-04 12:51:07.497091+00	2026-03-04 12:51:07.497091+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/c795ee33-43cf-4650-8490-31c220c9ab58	2026-03-04	8	2026-03-04 15:02:51.075862+00	\N
4d524f97-7984-4e1f-b8b7-cfa4595da1c8	2026-03-02 17:28:39.647265+00	2026-03-02 17:28:39.647265+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-02	4	2026-03-02 17:31:21.28699+00	\N
7ca52c66-0c2e-4fdb-82c0-2c68255cae65	2026-03-04 12:42:46.759418+00	2026-03-04 12:42:46.759418+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-04	99	2026-03-04 19:05:48.144876+00	\N
6062e6a4-d498-48e6-bf23-f05bd45630e3	2026-03-04 12:44:02.208537+00	2026-03-04 12:44:02.208537+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-04	86	2026-03-04 18:50:44.559808+00	\N
922f7659-9d03-4ce4-b9b0-eda1ee5c04ab	2026-03-04 15:06:28.718691+00	2026-03-04 15:06:28.718691+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-04	6	2026-03-04 15:44:32.749951+00	\N
9206d5cc-ae48-4919-9d05-71efe23b32c1	2026-03-04 15:38:04.805167+00	2026-03-04 15:38:04.805167+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-04	4	2026-03-04 16:45:50.817823+00	\N
b1e95f4c-0916-48e8-88d1-94896cd5542f	2026-03-04 15:44:18.164173+00	2026-03-04 15:44:18.164173+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-2893	2026-03-04	3	2026-03-04 16:44:52.239577+00	\N
06b37447-19d6-4f40-8979-e2669acd0b53	2026-03-04 12:44:17.795248+00	2026-03-04 12:44:17.795248+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-04	84	2026-03-04 18:52:25.327376+00	\N
01fcea57-54c4-4e48-8a84-e366b0c319a0	2026-03-04 15:39:51.437524+00	2026-03-04 15:39:51.437524+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514	2026-03-04	18	2026-03-04 18:53:40.2415+00	\N
d8805d31-b17d-435b-80c0-7f551e452ccc	2026-03-04 12:44:27.613386+00	2026-03-04 12:44:27.613386+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-04	22	2026-03-04 18:37:24.707153+00	\N
679d6e26-0317-4781-8e58-6da44940b043	2026-03-04 12:42:51.130474+00	2026-03-04 12:42:51.130474+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-04	5	2026-03-04 19:05:48.144931+00	\N
c313654b-6d12-4e34-a67d-6d154f3210df	2026-03-04 12:50:31.125277+00	2026-03-04 12:50:31.125277+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-04	1	2026-03-04 12:50:31.125277+00	\N
fcbadaaf-2a1e-4129-9e8d-659c5a36134c	2026-03-04 15:03:06.758317+00	2026-03-04 15:03:06.758317+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/c72d51f4-7eb5-4db1-8330-c3c22bf8a414	2026-03-04	8	2026-03-04 15:43:44.562793+00	\N
fc364771-f604-4e7d-9f1f-662ac23bdb70	2026-03-04 12:50:31.137217+00	2026-03-04 12:50:31.137217+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-04	1	2026-03-04 12:50:31.137217+00	\N
ed329ce9-facc-475f-94e9-6ca67f1a567f	2026-03-04 15:38:57.472362+00	2026-03-04 15:38:57.472362+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-04	4	2026-03-04 15:39:06.449128+00	\N
c785807c-9f5b-4c0c-922c-d134d4c56b23	2026-03-04 12:42:45.639808+00	2026-03-04 12:42:45.639808+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-04	27	2026-03-04 18:52:43.458972+00	\N
f1cabef4-40de-4cc9-84dd-84167cb217ad	2026-03-04 15:45:32.899233+00	2026-03-04 15:45:32.899233+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/returns	2026-03-04	4	2026-03-04 16:45:47.072719+00	\N
af0c1642-87db-4223-9427-77ff23a4ad5e	2026-03-04 15:29:33.992667+00	2026-03-04 15:29:33.992667+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/be949eef-56cc-4072-bbab-bdea422e5f8b	2026-03-04	1	2026-03-04 15:29:33.992667+00	\N
154bacef-b3d3-477b-b966-5e5f2dd7dab3	2026-03-04 15:03:26.083349+00	2026-03-04 15:03:26.083349+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-6377	2026-03-04	4	2026-03-04 15:38:33.791465+00	\N
f27e9fc7-6c66-4f53-93e2-ed61c9642eb1	2026-03-04 12:45:16.152069+00	2026-03-04 12:45:16.152069+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/new-product-test	2026-03-04	7	2026-03-04 18:52:24.719481+00	\N
b982a910-9cbc-4cdf-80b0-7d8f06ed821e	2026-03-04 15:43:26.00727+00	2026-03-04 15:43:26.00727+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c/reviews	2026-03-04	8	2026-03-04 18:37:24.724775+00	\N
a9dbfcdc-5377-48f7-aa2b-7cf31a2a5d77	2026-03-04 15:53:55.193635+00	2026-03-04 15:53:55.193635+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/ff3eed53-bfe0-4460-b861-bfc3c5384904	2026-03-04	6	2026-03-04 16:40:35.308777+00	\N
17dbb1f5-f0cd-4694-9d34-e88b55f5a7b2	2026-03-04 17:16:25.779645+00	2026-03-04 17:16:25.779645+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions	2026-03-04	48	2026-03-04 18:57:35.143042+00	\N
9d8b0db2-d950-434a-9c69-a526e60edd6b	2026-03-04 15:45:53.819119+00	2026-03-04 15:45:53.819119+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-04	10	2026-03-04 18:50:58.477025+00	\N
73436a5d-3fd0-4f63-91b6-b1d5c79b4f3f	2026-03-04 15:03:27.011537+00	2026-03-04 15:03:27.011537+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-6377	2026-03-04	7	2026-03-04 15:38:34.641099+00	\N
d36e3829-866e-4bc9-9f95-4cd6151178dd	2026-03-04 12:50:34.957376+00	2026-03-04 12:50:34.957376+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-04	56	2026-03-04 19:05:38.87302+00	\N
fc9eeffa-a777-482a-b274-edb31342799c	2026-03-04 15:30:08.584472+00	2026-03-04 15:30:08.584472+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/eb283ddc-eb49-4d98-b376-3657784f4c2a	2026-03-04	1	2026-03-04 15:30:08.584472+00	\N
fc27ca0b-230d-42b5-843c-c0336178fc09	2026-03-04 15:29:44.274459+00	2026-03-04 15:29:44.274459+00	e70063fd-c5b4-458b-a139-6130f2515580	/cart	2026-03-04	3	2026-03-04 15:53:00.371011+00	\N
801377a6-c956-4ceb-8cb3-61e1052dde01	2026-03-04 12:42:46.397071+00	2026-03-04 12:42:46.397071+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-04	165	2026-03-04 18:52:53.255509+00	\N
6cd6c70e-f8b6-4b16-9bbc-61cdf2cc5449	2026-03-04 15:44:19.001459+00	2026-03-04 15:44:19.001459+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-2893	2026-03-04	3	2026-03-04 16:44:53.222166+00	\N
4f839bf2-9b7f-4f33-a176-5e330b198bc0	2026-03-04 12:44:02.838643+00	2026-03-04 12:44:02.838643+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-04	8	2026-03-04 16:11:24.377248+00	\N
95c5fbdf-9f9c-4ab2-9bc3-04586964c588	2026-03-04 12:42:46.759488+00	2026-03-04 12:42:46.759488+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-04	31	2026-03-04 18:52:44.032709+00	\N
618b1b68-4fe8-41e3-92f5-e6951b77bbf1	2026-03-04 16:45:41.283963+00	2026-03-04 16:45:41.283963+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payments	2026-03-04	4	2026-03-04 17:48:37.5915+00	\N
bc8611f3-a517-4bb3-98d7-96a7465a3928	2026-03-04 16:45:39.360692+00	2026-03-04 16:45:39.360692+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-04	6	2026-03-04 18:35:14.432902+00	\N
85e78929-b13a-4143-bdf7-07d634713412	2026-03-04 17:40:50.320762+00	2026-03-04 17:40:50.320762+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-04	39	2026-03-04 18:51:04.451477+00	\N
82d7595d-17d0-49e2-bc17-2e37f08fb7a4	2026-03-04 16:45:48.838179+00	2026-03-04 16:45:48.838179+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-04	2	2026-03-04 16:45:48.844915+00	\N
e362488f-6abb-4529-b60f-9e22b76ff65a	2026-03-04 12:45:16.744739+00	2026-03-04 12:45:16.744739+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/new-product-test	2026-03-04	6	2026-03-04 18:52:25.371541+00	\N
9ea11265-aa6f-4f9b-bd8e-86d0f1658598	2026-03-05 15:38:22.366915+00	2026-03-05 15:38:22.366915+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-05	2	2026-03-05 16:17:01.598843+00	\N
80a7e227-e13d-4c00-8af5-15dece1875b4	2026-03-04 17:42:55.338447+00	2026-03-04 17:42:55.338447+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders	2026-03-04	62	2026-03-04 18:57:34.485728+00	\N
38a86c84-16c1-4955-9d9d-4783e8342d7a	2026-03-04 17:44:39.205512+00	2026-03-04 17:44:39.205512+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/b1ad4dbe-cbd1-4e27-9645-aea39f740918/status	2026-03-04	1	2026-03-04 17:44:39.205512+00	\N
c7dc3eed-735b-4f62-9c83-5e60e8e58c41	2026-03-05 15:45:45.531833+00	2026-03-05 15:45:45.531833+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/new-product-test	2026-03-05	2	2026-03-05 15:45:45.66113+00	\N
f4e41959-45d2-4a62-bb38-6d855f27bb5c	2026-03-05 16:23:08.002524+00	2026-03-05 16:23:08.002524+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/6b9378ed-3393-49c6-9624-4343621967a8/payments	2026-03-05	3	2026-03-05 16:28:09.391619+00	\N
6b086773-ed01-48a8-9f48-987fc3013412	2026-03-05 15:58:55.826374+00	2026-03-05 15:58:55.826374+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payments	2026-03-05	18	2026-03-05 17:53:45.454521+00	\N
cbc5a31d-4b40-427f-a04a-023c9fbd8f53	2026-03-05 15:46:42.299925+00	2026-03-05 15:46:42.299925+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/7d40c6f1-899d-4879-b1bc-b938478d8409	2026-03-05	4	2026-03-05 15:46:51.186734+00	\N
2d60a176-b520-45d4-a8be-c2a7a708b97f	2026-03-05 17:06:13.405488+00	2026-03-05 17:06:13.405488+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/subscribers	2026-03-05	14	2026-03-05 17:13:28.786685+00	\N
cd71f742-5b26-4481-b6e7-a42c75d6b7c6	2026-03-05 15:45:03.725931+00	2026-03-05 15:45:03.725931+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/6b9378ed-3393-49c6-9624-4343621967a8	2026-03-05	16	2026-03-05 17:24:04.606426+00	\N
846e52d2-63e6-4d9d-891b-a092a31256fe	2026-03-04 18:45:42.263464+00	2026-03-04 18:45:42.263464+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/e57e5892-31ff-4016-8a89-1f05d6fc6309/status	2026-03-04	1	2026-03-04 18:45:42.263464+00	\N
5cb34e80-1802-4c2d-b3f7-9d32c65be4f2	2026-03-04 12:44:18.135115+00	2026-03-04 12:44:18.135115+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-04	30	2026-03-04 17:49:59.081869+00	\N
15e1f264-2c97-4d9e-bbcb-4576ce4a1d58	2026-03-04 17:50:13.430952+00	2026-03-04 17:50:13.430952+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/e699cec1-e585-4eb9-8820-1fa5b12594f7	2026-03-04	3	2026-03-04 17:50:20.849231+00	\N
a1198d4d-f290-4947-af8b-998134ce1a7d	2026-03-05 16:30:35.368487+00	2026-03-05 16:30:35.368487+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions	2026-03-05	10	2026-03-05 16:46:38.389679+00	\N
e784373b-5572-4736-a96a-c67f41007639	2026-03-04 17:50:38.949202+00	2026-03-04 17:50:38.949202+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/5eb15aa1-2327-4c12-8309-3638c4837120	2026-03-04	3	2026-03-04 18:02:12.038567+00	\N
ee472baf-904a-4d05-9264-9642dabcd61a	2026-03-04 17:48:05.045973+00	2026-03-04 17:48:05.045973+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/b1ad4dbe-cbd1-4e27-9645-aea39f740918	2026-03-04	10	2026-03-04 18:46:36.157685+00	\N
5c5f1195-e579-44df-8692-4d0bbc20ac94	2026-03-05 16:49:04.658671+00	2026-03-05 16:49:04.658671+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-05	18	2026-03-05 18:03:37.548733+00	\N
2e13db13-1293-4be5-8805-b638a2b54cbf	2026-03-04 18:46:40.152747+00	2026-03-04 18:46:40.152747+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/e57e5892-31ff-4016-8a89-1f05d6fc6309	2026-03-04	2	2026-03-04 18:46:40.21026+00	\N
984480fd-fe88-4f22-8592-2c8ddc6d6174	2026-03-05 16:50:28.143996+00	2026-03-05 16:50:28.143996+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/create	2026-03-05	2	2026-03-05 16:50:28.166398+00	\N
449ca7c9-c318-417d-9595-1db6aa76e999	2026-03-05 15:42:42.772411+00	2026-03-05 15:42:42.772411+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/8f803440-73e5-49f1-94e9-9e0b4d3076b1/status	2026-03-05	1	2026-03-05 15:42:42.772411+00	\N
1c110d30-f94c-4c48-9144-52f8c6570925	2026-03-05 15:46:00.051859+00	2026-03-05 15:46:00.051859+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-05	2	2026-03-05 17:56:44.575008+00	\N
b44c5f3c-7f52-4811-bc49-d9fede8a8344	2026-03-05 15:47:27.170836+00	2026-03-05 15:47:27.170836+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-05	18	2026-03-05 17:20:07.822434+00	\N
8c2b84cc-35d6-4842-9e54-8d8e40f21a5d	2026-03-04 12:44:02.221351+00	2026-03-04 12:44:02.221351+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-04	82	2026-03-04 18:48:29.768809+00	\N
5b078073-8dc2-4c01-9d0f-ffbf45af7432	2026-03-05 15:38:26.019878+00	2026-03-05 15:38:26.019878+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-05	56	2026-03-05 18:03:37.975455+00	\N
5016b4f3-0fc4-42b1-a2b9-72fd5a045e5b	2026-03-05 15:45:46.307505+00	2026-03-05 15:45:46.307505+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/new-product-test	2026-03-05	1	2026-03-05 15:45:46.307505+00	\N
91ca46bc-a6f3-4e94-a993-1104c4eb8c86	2026-03-05 15:40:55.177107+00	2026-03-05 15:40:55.177107+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/2a38347c-37cc-4178-857f-2de233c4ab34	2026-03-05	2	2026-03-05 15:40:55.220525+00	\N
1a8f35c8-1af4-456c-8728-ff53571d7d88	2026-03-05 15:38:07.54322+00	2026-03-05 15:38:07.54322+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-05	32	2026-03-05 17:57:41.319351+00	\N
2bb6721e-7c41-49dd-952f-a82ee156fbf1	2026-03-05 15:40:03.53715+00	2026-03-05 15:40:03.53715+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/2a38347c-37cc-4178-857f-2de233c4ab34/status	2026-03-05	1	2026-03-05 15:40:03.53715+00	\N
e6342d82-5010-42b2-bc59-2c1e0ac8f6e3	2026-03-04 18:51:20.978848+00	2026-03-04 18:51:20.978848+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/7dab6627-7bbe-44b3-8f61-6c09f0291013/status	2026-03-04	1	2026-03-04 18:51:20.978848+00	\N
6cd4db85-a1c5-4ba5-b877-0478f564c6d9	2026-03-04 17:50:23.771696+00	2026-03-04 17:50:23.771696+00	e70063fd-c5b4-458b-a139-6130f2515580	/checkout	2026-03-04	3	2026-03-04 18:52:37.976013+00	\N
e5cb621c-7608-4d35-91d7-479fa44ac267	2026-03-04 17:50:28.944008+00	2026-03-04 17:50:28.944008+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/sync	2026-03-04	2	2026-03-04 18:52:42.112611+00	\N
7faa917d-1c3c-4c08-9b35-452443b704f5	2026-03-05 17:09:51.023442+00	2026-03-05 17:09:51.023442+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/returns	2026-03-05	8	2026-03-05 17:52:35.617613+00	\N
39542123-a796-4879-bb17-58fa11306ab1	2026-03-05 16:50:22.658573+00	2026-03-05 16:50:22.658573+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/create	2026-03-05	2	2026-03-05 16:50:22.691538+00	\N
24545d8b-b9b3-4f25-acb4-14ed8a7ad4d7	2026-03-04 18:53:26.90524+00	2026-03-04 18:53:26.90524+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/06d2e519-617a-40c1-bc35-9504e7ffc42e	2026-03-04	1	2026-03-04 18:53:26.90524+00	\N
f42ee5fe-4ee2-4cb0-b4a6-d11df4438bec	2026-03-05 15:45:46.143942+00	2026-03-05 15:45:46.143942+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-05	8	2026-03-05 16:53:07.492+00	\N
f28dc265-18be-4899-a621-34909431e7a0	2026-03-05 15:44:32.46101+00	2026-03-05 15:44:32.46101+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/6b9378ed-3393-49c6-9624-4343621967a8/status	2026-03-05	1	2026-03-05 15:44:32.46101+00	\N
9c7d07a9-8f12-417c-8127-02e150764de8	2026-03-05 17:06:04.253244+00	2026-03-05 17:06:04.253244+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews	2026-03-05	31	2026-03-05 17:13:01.547724+00	\N
3ef8db06-6dad-4c9a-9bee-f0eba73f52f0	2026-03-05 17:58:25.624669+00	2026-03-05 17:58:25.624669+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/a47ba302-b6ae-46b2-894d-54179ac76c4e	2026-03-05	5	2026-03-05 17:59:22.888332+00	\N
6ef74579-02eb-4ce8-a876-1b82b6695227	2026-03-05 15:39:33.137509+00	2026-03-05 15:39:33.137509+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514/reviews	2026-03-05	22	2026-03-05 15:46:59.570584+00	\N
7469fc06-deb9-482b-a725-6ea3e90ee4ec	2026-03-05 15:46:20.647752+00	2026-03-05 15:46:20.647752+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/sync	2026-03-05	2	2026-03-05 17:57:39.681367+00	\N
dbbbf6e8-26b3-4725-b698-1ad7a4750894	2026-03-05 17:51:47.04781+00	2026-03-05 17:51:47.04781+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/coupons	2026-03-05	14	2026-03-05 17:55:15.985666+00	\N
93d3c5c6-b78a-441d-94c9-72640b193592	2026-03-05 15:39:33.102316+00	2026-03-05 15:39:33.102316+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514	2026-03-05	24	2026-03-05 15:47:27.084005+00	\N
0fb4a3b9-d223-40ef-8e9c-583dce7cea17	2026-03-05 15:47:27.147049+00	2026-03-05 15:47:27.147049+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-05	16	2026-03-05 17:20:06.78118+00	\N
485f1dde-6a14-4623-90ad-2f640f978973	2026-03-05 15:38:40.42127+00	2026-03-05 15:38:40.42127+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-05	52	2026-03-05 17:53:50.628349+00	\N
48445375-a37a-4490-915f-7af0961bf8e9	2026-03-05 15:38:11.269515+00	2026-03-05 15:38:11.269515+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-05	6	2026-03-05 17:19:42.803026+00	\N
ebb7d5be-cc19-422d-a780-3ccd97c39937	2026-03-05 15:38:22.35134+00	2026-03-05 15:38:22.35134+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-05	2	2026-03-05 16:17:01.493889+00	\N
44a44626-f359-42a1-8b4f-c7f76162c540	2026-03-05 15:38:36.427776+00	2026-03-05 15:38:36.427776+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders	2026-03-05	74	2026-03-05 17:24:00.843973+00	\N
cebec986-4e09-4efe-85ec-f3a17f2d3c9a	2026-03-05 16:40:45.550036+00	2026-03-05 16:40:45.550036+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions/stock-summary	2026-03-05	32	2026-03-05 17:53:49.285579+00	\N
6bb2d055-eb54-4cd2-a12e-d5d074c7a74c	2026-03-05 15:46:20.713959+00	2026-03-05 15:46:20.713959+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-05	26	2026-03-05 17:57:59.413529+00	\N
40c5c493-9fec-4f1d-b464-b20b33d85fc3	2026-03-05 15:38:07.535748+00	2026-03-05 15:38:07.535748+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-05	76	2026-03-05 17:57:41.309421+00	\N
9da22480-aaa5-4fa2-bb64-28b26c241338	2026-03-05 16:49:14.462971+00	2026-03-05 16:49:14.462971+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-05	30	2026-03-05 17:17:35.528013+00	\N
9ae21791-d8dc-4b92-bd1f-3187d315200d	2026-03-05 16:53:06.11094+00	2026-03-05 16:53:06.11094+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-05	2	2026-03-05 16:53:06.121941+00	\N
a59f15c8-e337-4117-bfc1-be8c0a72f3d8	2026-03-05 16:53:00.120342+00	2026-03-05 16:53:00.120342+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-05	28	2026-03-05 17:13:27.290363+00	\N
9a9039a1-825f-4703-9637-285335855222	2026-03-05 15:38:06.79737+00	2026-03-05 15:38:06.79737+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-05	7	2026-03-05 17:57:41.067966+00	\N
4952ff41-0396-45a5-ac17-66ef0b4bd000	2026-03-05 17:57:01.202141+00	2026-03-05 17:57:01.202141+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/coupon/apply	2026-03-05	2	2026-03-05 17:57:33.467655+00	\N
f7c54a5b-4dec-455a-bbd9-65fc1f791987	2026-03-05 17:57:21.820938+00	2026-03-05 17:57:21.820938+00	e70063fd-c5b4-458b-a139-6130f2515580	/cart	2026-03-05	1	2026-03-05 17:57:21.820938+00	\N
aaaed694-66d6-4a46-b773-3a8fe3ba3ba4	2026-03-05 15:38:22.532225+00	2026-03-05 15:38:22.532225+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-05	41	2026-03-05 17:59:27.527632+00	\N
fc98570d-ce73-49f7-9cf7-555ef743f3e7	2026-03-05 15:46:16.663646+00	2026-03-05 15:46:16.663646+00	e70063fd-c5b4-458b-a139-6130f2515580	/checkout	2026-03-05	4	2026-03-05 17:57:24.694406+00	\N
4403c0c2-54c6-42a3-a05e-57c3a4c2bd72	2026-03-05 17:57:27.868235+00	2026-03-05 17:57:27.868235+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/coupon/remove	2026-03-05	1	2026-03-05 17:57:27.868235+00	\N
56060ce3-2ca4-433b-9281-031f14b59e23	2026-03-05 15:38:06.860167+00	2026-03-05 15:38:06.860167+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-05	27	2026-03-05 17:59:07.027607+00	\N
f9e975a5-0764-4dc8-b3d0-864222f31f22	2026-03-05 15:38:07.868145+00	2026-03-05 15:38:07.868145+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-05	8	2026-03-05 17:57:41.630473+00	\N
0a25c94e-cfde-4223-954a-68865cb506f3	2026-03-05 15:38:07.868041+00	2026-03-05 15:38:07.868041+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-05	20	2026-03-05 17:57:41.630404+00	\N
fe527b81-5ace-4329-ab52-91b259556608	2026-03-06 07:15:31.334602+00	2026-03-06 07:15:31.334602+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-06	47	2026-03-06 14:52:43.405553+00	\N
49ff04a6-90fe-4324-905f-d41aa1ed2478	2026-03-06 08:44:16.510438+00	2026-03-06 08:44:16.510438+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-06	6	2026-03-06 14:53:08.028293+00	\N
1c458b72-908c-4ce5-b453-d9921ef95fb5	2026-03-06 08:42:42.969101+00	2026-03-06 08:42:42.969101+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-06	2	2026-03-06 08:42:43.186393+00	\N
6847c4e3-ad73-4431-a374-80fcfbe96687	2026-03-06 03:16:38.450111+00	2026-03-06 03:16:38.450111+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions	2026-03-06	2	2026-03-06 03:16:38.459904+00	\N
056a4475-62be-402e-8ee2-b315659f7995	2026-03-06 03:26:33.960697+00	2026-03-06 03:26:33.960697+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-06	24	2026-03-06 13:04:26.77+00	\N
d0897f4f-85ed-4c28-9827-99f7078aced9	2026-03-06 08:42:43.064595+00	2026-03-06 08:42:43.064595+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-06	2	2026-03-06 08:42:43.206418+00	\N
361f9686-21e9-4fa7-9377-9eb041d9a4f3	2026-03-06 07:20:00.939251+00	2026-03-06 07:20:00.939251+00	e70063fd-c5b4-458b-a139-6130f2515580	/checkout	2026-03-06	3	2026-03-06 08:41:19.660242+00	\N
2c6aed44-e56f-4653-80ed-27c4ba0e4acd	2026-03-06 08:42:43.30219+00	2026-03-06 08:42:43.30219+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-06	1	2026-03-06 08:42:43.30219+00	\N
c255f315-1485-4888-b97c-3949ae51f7cd	2026-03-06 03:15:11.786568+00	2026-03-06 03:15:11.786568+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-06	99	2026-03-06 14:54:42.619014+00	\N
d6c44812-ba98-4694-af11-4b827c5f6937	2026-03-06 05:36:12.464476+00	2026-03-06 05:36:12.464476+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/95c951f5-fb08-4dc2-959c-81ebbd040f80	2026-03-06	1	2026-03-06 05:36:12.464476+00	\N
c5ac540c-1840-4c4f-8bec-4599bd45a010	2026-03-06 03:15:08.429845+00	2026-03-06 03:15:08.429845+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions	2026-03-06	75	2026-03-06 14:52:17.105303+00	\N
d28760b4-8e83-4c61-98d1-cb1bec963dcb	2026-03-06 08:57:16.67875+00	2026-03-06 08:57:16.67875+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-06	2	2026-03-06 09:27:01.49019+00	\N
07716e0b-5842-40a6-9646-e7f69bed4e68	2026-03-06 05:37:51.938507+00	2026-03-06 05:37:51.938507+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-06	34	2026-03-06 08:42:38.203892+00	\N
fb3ea774-e354-4c40-b954-fd25a337eb7b	2026-03-06 09:06:08.725937+00	2026-03-06 09:06:08.725937+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/supplier-ledger/2f62a619-47d3-453c-a040-994509e8d923	2026-03-06	6	2026-03-06 13:05:28.13285+00	\N
29be4cb3-eb8b-4c95-a8d5-9e4a93b0114d	2026-03-06 08:44:14.958791+00	2026-03-06 08:44:14.958791+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-06	18	2026-03-06 14:52:53.986794+00	\N
8c9a50be-0257-479a-97ae-019bd6e052e6	2026-03-06 03:15:11.758933+00	2026-03-06 03:15:11.758933+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-06	103	2026-03-06 14:54:40.83701+00	\N
b9c47cde-7a95-455e-b500-e8d3e120c1fa	2026-03-06 13:01:29.529688+00	2026-03-06 13:01:29.529688+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/6b9378ed-3393-49c6-9624-4343621967a8	2026-03-06	2	2026-03-06 13:01:29.580823+00	\N
1c3d88f8-a5db-4d46-a8a0-c971df51f478	2026-03-06 03:26:34.449705+00	2026-03-06 03:26:34.449705+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-06	45	2026-03-06 13:04:29.595346+00	\N
c3d93941-7b2e-4b6e-a8f1-be0118eaf007	2026-03-06 09:11:13.758612+00	2026-03-06 09:11:13.758612+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/cash-flow	2026-03-06	24	2026-03-06 13:38:42.516988+00	\N
dcb2808b-80b2-4dd9-8124-f51f6657f416	2026-03-06 08:41:28.948765+00	2026-03-06 08:41:28.948765+00	e70063fd-c5b4-458b-a139-6130f2515580	/cart	2026-03-06	1	2026-03-06 08:41:28.948765+00	\N
470f5057-488d-4860-ac4a-621a4fd553e9	2026-03-06 06:49:21.182336+00	2026-03-06 06:49:21.182336+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/2fa4de77-cbe5-4a7f-93e0-ea45ee9e9eae	2026-03-06	1	2026-03-06 06:49:21.182336+00	\N
be48776c-7afb-4c95-b67d-da8cfaf8075c	2026-03-06 06:25:12.006138+00	2026-03-06 06:25:12.006138+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/cd51e117-93b3-4509-9385-e5596263a076	2026-03-06	1	2026-03-06 06:25:12.006138+00	\N
6967b7ee-4669-4c76-9f3f-451d7cb313bb	2026-03-06 08:41:34.238247+00	2026-03-06 08:41:34.238247+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/acbe8762-2e48-4c05-8406-28cc79e4571c	2026-03-06	1	2026-03-06 08:41:34.238247+00	\N
e6063634-0d50-4cc5-857a-29594d0de158	2026-03-06 08:52:39.798593+00	2026-03-06 08:52:39.798593+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/profit-loss	2026-03-06	56	2026-03-06 13:38:36.077236+00	\N
7ac6b0b6-ebd9-4a9e-ba36-c04bbda4e3c5	2026-03-06 08:44:17.38217+00	2026-03-06 08:44:17.38217+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/subscribers	2026-03-06	8	2026-03-06 14:53:33.417514+00	\N
366f825f-684d-4ca8-8317-fda1f2a5200a	2026-03-06 07:49:19.830709+00	2026-03-06 07:49:19.830709+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/coupon/apply	2026-03-06	1	2026-03-06 07:49:19.830709+00	\N
b80899be-fa17-462f-9c5e-46c0c5104e43	2026-03-06 02:45:47.462839+00	2026-03-06 02:45:47.462839+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/coupons	2026-03-06	78	2026-03-06 14:52:22.26609+00	\N
592a71a6-5bee-4ad3-a40d-6e672a5d87e8	2026-03-06 07:20:13.400283+00	2026-03-06 07:20:13.400283+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/coupon/remove	2026-03-06	2	2026-03-06 07:49:25.747808+00	\N
8208eb38-c152-4e26-bbf4-347ec20d0040	2026-03-06 08:37:23.279424+00	2026-03-06 08:37:23.279424+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/expenses	2026-03-06	40	2026-03-06 14:52:13.802599+00	\N
a7c3ae41-5189-45d5-8021-9bf9e2ae48f9	2026-03-06 02:45:25.674336+00	2026-03-06 02:45:25.674336+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-06	34	2026-03-06 14:49:23.20571+00	\N
f5b6b946-e1ad-4cc3-a297-3144320f94fe	2026-03-06 08:36:12.516911+00	2026-03-06 08:36:12.516911+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/invoices	2026-03-06	46	2026-03-06 14:52:15.367065+00	\N
74c969cb-f330-4ce8-b762-0bd4b3c05c5b	2026-03-06 08:41:02.788264+00	2026-03-06 08:41:02.788264+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/8a6fe16d-5b09-40e5-b9b7-6ffdf2984bd9	2026-03-06	1	2026-03-06 08:41:02.788264+00	\N
27f9e5b2-0fa1-4378-aafe-23fca8fe74ce	2026-03-06 07:21:13.719033+00	2026-03-06 07:21:13.719033+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/a47ba302-b6ae-46b2-894d-54179ac76c4e	2026-03-06	10	2026-03-06 12:55:43.916102+00	\N
b7a7032f-95ee-4b62-a5f5-ed1aa0fec6d0	2026-03-06 08:51:12.229845+00	2026-03-06 08:51:12.229845+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/14942467-ebc7-454a-b113-d8212187fb0a	2026-03-06	2	2026-03-06 08:51:12.284567+00	\N
b32a42d9-e068-4107-a593-8e47ce4cd84d	2026-03-06 08:51:50.83479+00	2026-03-06 08:51:50.83479+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-06	40	2026-03-06 14:51:32.591687+00	\N
17fcd966-8705-4beb-8d11-eba911c79e7c	2026-03-06 03:13:12.815966+00	2026-03-06 03:13:12.815966+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders	2026-03-06	14	2026-03-06 14:52:45.014262+00	\N
b7ac4c98-32d6-436d-9bd8-3cdbaa6990f9	2026-03-06 03:13:15.330191+00	2026-03-06 03:13:15.330191+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions/stock-summary	2026-03-06	18	2026-03-06 14:52:32.4899+00	\N
a7b9722f-6369-4fa8-89ac-3c1ef46023b6	2026-03-06 07:47:49.752377+00	2026-03-06 07:47:49.752377+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/7714afc8-c715-45bf-97ef-a88a4cdbf6db	2026-03-06	1	2026-03-06 07:47:49.752377+00	\N
9a128c14-33de-4229-ba45-9d7676f4d9a8	2026-03-06 06:52:30.472913+00	2026-03-06 06:52:30.472913+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-06	8	2026-03-06 14:51:22.365206+00	\N
f49738e9-c2fe-4c9c-8472-a5c96dab0e4a	2026-03-06 02:45:26.659985+00	2026-03-06 02:45:26.659985+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-06	134	2026-03-06 15:05:53.306574+00	\N
b5ba6304-7dd1-4be9-8031-fca2a324d795	2026-03-06 02:46:00.843215+00	2026-03-06 02:46:00.843215+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-06	89	2026-03-06 14:52:48.437741+00	\N
83f63adc-5fa2-461a-bbfb-da4fa7aa455d	2026-03-06 07:19:56.235691+00	2026-03-06 07:19:56.235691+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/8018ba9c-047f-4dcb-bbb1-ec8da8c9ffb6	2026-03-06	2	2026-03-06 07:20:32.077003+00	\N
59b77e3c-62ba-476b-a12c-0743488bf870	2026-03-06 02:45:58.386804+00	2026-03-06 02:45:58.386804+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/returns	2026-03-06	40	2026-03-06 14:51:43.386601+00	\N
292131e7-c554-478f-8799-369fc0ec170c	2026-03-06 06:52:30.520541+00	2026-03-06 06:52:30.520541+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c/reviews	2026-03-06	6	2026-03-06 14:51:22.376886+00	\N
2874c901-6d70-4554-a72d-442774aa5506	2026-03-06 07:02:12.849743+00	2026-03-06 07:02:12.849743+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/07ef64cb-7d02-4255-9cd6-b78daf012032	2026-03-06	1	2026-03-06 07:02:12.849743+00	\N
2b9f6dfa-2f01-4ee2-9afe-cbe6c5296bb1	2026-03-06 02:45:26.640377+00	2026-03-06 02:45:26.640377+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-06	159	2026-03-06 14:49:25.686379+00	\N
7071336e-cc45-492a-8f16-7ffe582efc70	2026-03-06 06:49:06.159566+00	2026-03-06 06:49:06.159566+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-06	6	2026-03-06 08:41:08.782798+00	\N
779d8a6f-da4b-4097-8bb4-d4cf7fd3ca3d	2026-03-06 09:19:07.652258+00	2026-03-06 09:19:07.652258+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/finance-summary	2026-03-06	36	2026-03-06 13:38:32.896896+00	\N
c5369906-a004-456b-af8c-63edee65b787	2026-03-06 08:51:20.474243+00	2026-03-06 08:51:20.474243+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/162f10a5-9e0e-42c2-9bf2-1ea2474149f4	2026-03-06	2	2026-03-06 08:51:20.657977+00	\N
3e68c215-91cc-42b4-b7e3-2861f16630ef	2026-03-06 02:45:26.5347+00	2026-03-06 02:45:26.5347+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-06	199	2026-03-06 14:54:41.452788+00	\N
e4177c3d-2181-4f89-bbb3-56fecbe1ab5b	2026-03-06 02:45:56.265923+00	2026-03-06 02:45:56.265923+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payments	2026-03-06	40	2026-03-06 14:51:44.842853+00	\N
a3eba6d5-1e2b-41e6-a90e-beb9442227bb	2026-03-06 02:45:42.309186+00	2026-03-06 02:45:42.309186+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-06	163	2026-03-06 14:51:31.679782+00	\N
587fb32c-4192-421e-8aa9-849fbccbc70f	2026-03-06 12:55:31.872755+00	2026-03-06 12:55:31.872755+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/cda460d8-7598-42df-b4bf-780bd14c8a08	2026-03-06	10	2026-03-06 13:04:35.99913+00	\N
f5c5aa3c-f1de-4da7-917d-839a7398bc56	2026-03-06 08:55:50.951894+00	2026-03-06 08:55:50.951894+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-06	2	2026-03-06 09:25:55.129766+00	\N
04e48e06-a521-4a47-b4b2-64ad1d51bbd4	2026-03-06 08:57:16.789684+00	2026-03-06 08:57:16.789684+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-06	2	2026-03-06 09:27:01.505197+00	\N
641e82ca-fe87-4662-b42d-9f0b5faf7b51	2026-03-06 09:36:56.629983+00	2026-03-06 09:36:56.629983+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/2a38347c-37cc-4178-857f-2de233c4ab34	2026-03-06	2	2026-03-06 09:36:56.680485+00	\N
995a0813-3d85-4187-b1a0-f9d80dd9154d	2026-03-06 09:40:31.804838+00	2026-03-06 09:40:31.804838+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/export/sales	2026-03-06	1	2026-03-06 09:40:31.804838+00	\N
5ee2b497-cf33-4ab2-a831-6ffce2e1b0ec	2026-03-06 03:26:34.737397+00	2026-03-06 03:26:34.737397+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-06	23	2026-03-06 12:41:57.571935+00	\N
de348bba-3f6c-43c3-9baf-48a8e21d6b85	2026-03-06 02:45:25.596558+00	2026-03-06 02:45:25.596558+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-06	57	2026-03-06 14:49:23.079519+00	\N
dec4f9cd-823d-4a30-bf48-8a6a69f8cbc8	2026-03-06 02:45:26.74299+00	2026-03-06 02:45:26.74299+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-06	92	2026-03-06 14:49:25.796042+00	\N
560a8f04-7c3b-4463-8982-05cce3b0b3ac	2026-03-06 02:45:26.743073+00	2026-03-06 02:45:26.743073+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-06	27	2026-03-06 14:49:25.7961+00	\N
bcc5661c-8da0-48b5-8d30-9a173daf5fb2	2026-03-06 13:06:59.928336+00	2026-03-06 13:06:59.928336+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-2893	2026-03-06	1	2026-03-06 13:06:59.928336+00	\N
6371ec36-6fc8-491d-8ff2-f370df25f38c	2026-03-06 13:07:00.994022+00	2026-03-06 13:07:00.994022+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-2893	2026-03-06	1	2026-03-06 13:07:00.994022+00	\N
391bcff4-4481-4cbd-b188-0347adc86975	2026-03-07 16:37:32.50441+00	2026-03-07 16:37:32.50441+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions	2026-03-07	2	2026-03-07 16:37:32.515359+00	\N
c06718d2-6798-4408-8149-be46754f751f	2026-03-07 17:10:09.455372+00	2026-03-07 17:10:09.455372+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/2a38347c-37cc-4178-857f-2de233c4ab34	2026-03-07	2	2026-03-07 17:10:09.513419+00	\N
4bc6f1f9-3c57-462f-a1fc-8f352a0246ee	2026-03-07 14:20:21.907675+00	2026-03-07 14:20:21.907675+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-07	55	2026-03-07 18:25:44.828878+00	\N
2a1f5979-7eee-4106-98e4-f2c2f8b1aada	2026-03-07 15:19:40.795619+00	2026-03-07 15:19:40.795619+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/contact	2026-03-07	2	2026-03-07 15:24:38.220732+00	\N
07d9f4af-daa6-41ed-89fb-5f84211b6685	2026-03-07 17:28:53.623155+00	2026-03-07 17:28:53.623155+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/returns	2026-03-07	2	2026-03-07 17:28:53.656238+00	\N
47c5bf9c-37da-4324-94a9-33bdbc2e0084	2026-03-07 14:54:59.315293+00	2026-03-07 14:54:59.315293+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-07	2	2026-03-07 14:54:59.444546+00	\N
3b3fe88b-7380-42ce-9a7a-2f8b25193ffa	2026-03-07 16:37:48.549015+00	2026-03-07 16:37:48.549015+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders	2026-03-07	10	2026-03-07 17:28:58.305783+00	\N
57d96963-f3f5-4a2e-8472-853425c3c8b0	2026-03-07 14:15:28.736545+00	2026-03-07 14:15:28.736545+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-07	214	2026-03-07 18:25:51.878872+00	\N
abc581a4-9549-4d5e-b59f-5f0b09d39c5c	2026-03-06 14:52:58.857758+00	2026-03-06 14:52:58.857758+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews	2026-03-06	10	2026-03-06 14:53:27.791221+00	\N
e0d2003f-86ee-424d-badb-a0febf137833	2026-03-07 14:15:31.403864+00	2026-03-07 14:15:31.403864+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/platform/settings	2026-03-07	1	2026-03-07 14:15:31.403864+00	\N
3a1c96dd-9544-477a-bb46-bf958674429c	2026-03-07 15:19:41.579888+00	2026-03-07 15:19:41.579888+00	e70063fd-c5b4-458b-a139-6130f2515580	/contact	2026-03-07	2	2026-03-07 15:24:39.026444+00	\N
832963d3-4da4-4602-9a1d-828d0a181df6	2026-03-07 16:36:18.71255+00	2026-03-07 16:36:18.71255+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-07	19	2026-03-07 17:13:09.685367+00	\N
1602108a-bff6-4d92-98c3-3bd6232bb3e9	2026-03-07 14:55:10.581718+00	2026-03-07 14:55:10.581718+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-07	10	2026-03-07 16:15:45.175294+00	\N
e6499c45-1234-492d-9d83-a9605e009e03	2026-03-07 14:16:57.87528+00	2026-03-07 14:16:57.87528+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-07	353	2026-03-07 18:25:52.209148+00	\N
49ec6c31-cb74-479a-ae45-d85e189999d8	2026-03-07 18:07:07.385238+00	2026-03-07 18:07:07.385238+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/undefined	2026-03-07	28	2026-03-07 18:25:25.373698+00	\N
15366647-7d25-4658-9595-caa8880e22ae	2026-03-07 14:54:57.594342+00	2026-03-07 14:54:57.594342+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/162f10a5-9e0e-42c2-9bf2-1ea2474149f4	2026-03-07	4	2026-03-07 14:55:28.804372+00	\N
e20ba392-1c42-4fba-a184-2a6ff96fc70d	2026-03-07 14:23:47.079763+00	2026-03-07 14:23:47.079763+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-07	70	2026-03-07 18:25:47.970493+00	\N
3689a521-f6a6-4374-90f6-6cd421f23350	2026-03-07 16:23:28.109298+00	2026-03-07 16:23:28.109298+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-07	1	2026-03-07 16:23:28.109298+00	\N
10946e2a-863f-4890-a642-0dd0461c3778	2026-03-07 16:23:28.120649+00	2026-03-07 16:23:28.120649+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-07	1	2026-03-07 16:23:28.120649+00	\N
b9a3426c-19d8-4d53-83c2-4863cd1630c8	2026-03-07 14:15:28.693576+00	2026-03-07 14:15:28.693576+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-07	380	2026-03-07 18:25:45.521436+00	\N
24889304-096f-46f0-aabd-af09992d8d22	2026-03-07 15:21:11.78277+00	2026-03-07 15:21:11.78277+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-07	10	2026-03-07 16:33:30.166557+00	\N
2937eb55-26ab-4e8e-9951-687759929d01	2026-03-07 17:15:20.53234+00	2026-03-07 17:15:20.53234+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/expenses	2026-03-07	2	2026-03-07 17:15:20.562704+00	\N
58bf8633-50c6-42ed-a5f3-eae7faa38d9c	2026-03-07 15:21:12.047618+00	2026-03-07 15:21:12.047618+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-07	5	2026-03-07 16:33:30.312436+00	\N
bec45f09-22e2-434d-8bc8-f1fd01e75706	2026-03-07 15:21:11.856023+00	2026-03-07 15:21:11.856023+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-07	12	2026-03-07 16:33:36.229485+00	\N
cf8ac776-a6dd-4e0c-91f7-1bbc5d347677	2026-03-07 17:15:34.503554+00	2026-03-07 17:15:34.503554+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-07	20	2026-03-07 17:24:51.192313+00	\N
bd21d798-7b15-4b26-be9a-48fdde8d7e97	2026-03-07 17:28:54.052258+00	2026-03-07 17:28:54.052258+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payments	2026-03-07	2	2026-03-07 17:28:54.065525+00	\N
485bb9f2-d668-49ad-8f60-a51d262f4d7b	2026-03-07 16:37:18.233502+00	2026-03-07 16:37:18.233502+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-07	26	2026-03-07 17:41:42.326009+00	\N
e43b1f1f-3671-4885-a4a4-2ebc8a346ba3	2026-03-07 14:28:36.451193+00	2026-03-07 14:28:36.451193+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-07	95	2026-03-07 17:41:44.773345+00	\N
276e9d8c-d388-4640-8269-6a63f3c79bdb	2026-03-07 14:23:47.082596+00	2026-03-07 14:23:47.082596+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-07	70	2026-03-07 18:25:47.979464+00	\N
3ab86885-accd-434e-b109-89101d0c88be	2026-03-07 16:22:33.782038+00	2026-03-07 16:22:33.782038+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-07	2	2026-03-07 16:22:34.021218+00	\N
5cab90c6-276f-471e-87ef-e35e38f7fd37	2026-03-07 16:35:49.237072+00	2026-03-07 16:35:49.237072+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-07	34	2026-03-07 17:28:58.463712+00	\N
6e6de737-13b5-4678-8f20-5861abd47c37	2026-03-07 14:15:31.552145+00	2026-03-07 14:15:31.552145+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-07	283	2026-03-07 18:24:37.647874+00	\N
1aeafc59-8c70-4ffb-a083-8094c4e4add5	2026-03-07 16:37:27.694254+00	2026-03-07 16:37:27.694254+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions/stock-summary	2026-03-07	8	2026-03-07 17:28:57.300737+00	\N
302e9c36-d86d-4026-aa83-dba27e5ade0c	2026-03-07 18:24:28.809667+00	2026-03-07 18:24:28.809667+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/test-offer	2026-03-07	2	2026-03-07 18:24:36.877973+00	\N
cc903120-61c0-44cd-9a4d-d79c7e3f082d	2026-03-07 17:43:42.395517+00	2026-03-07 17:43:42.395517+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-07	22	2026-03-07 18:25:48.599213+00	\N
5ed40ee8-0953-43f8-8673-e877f16ca68c	2026-03-07 17:15:52.151685+00	2026-03-07 17:15:52.151685+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/subscribers	2026-03-07	14	2026-03-07 17:24:52.077793+00	\N
37fe78a5-bfd1-4c87-8b3c-d1d48b061d6a	2026-03-07 14:16:57.902993+00	2026-03-07 14:16:57.902993+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-07	335	2026-03-07 18:25:52.22577+00	\N
19266be2-8ba0-4881-a151-b613d393ebb2	2026-03-08 13:15:35.843406+00	2026-03-08 13:15:35.843406+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-08	14	2026-03-08 18:29:43.67487+00	\N
f96dcc00-5945-4dce-9c60-50f6f7dad526	2026-03-07 16:35:59.676137+00	2026-03-07 16:35:59.676137+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/invoices	2026-03-07	6	2026-03-07 17:28:54.794405+00	\N
18fbce62-a4bb-4e6b-86e4-dc4a76ee285c	2026-03-07 17:15:37.7541+00	2026-03-07 17:15:37.7541+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews	2026-03-07	13	2026-03-07 17:22:48.059426+00	\N
36292836-af4a-4dd4-9774-33cf4293bc7a	2026-03-07 16:36:19.050624+00	2026-03-07 16:36:19.050624+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-07	28	2026-03-07 17:28:57.590031+00	\N
1f2c10e0-8b3d-4b48-befd-2a401f7f0206	2026-03-07 17:43:43.205447+00	2026-03-07 17:43:43.205447+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-07	23	2026-03-07 18:25:49.384241+00	\N
c0c8e434-7116-442c-a916-b6139afc75ae	2026-03-07 17:15:21.774171+00	2026-03-07 17:15:21.774171+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/coupons	2026-03-07	4	2026-03-07 17:28:54.969584+00	\N
779511f5-75d7-47e4-a203-f0eb7870df32	2026-03-07 17:14:59.489882+00	2026-03-07 17:14:59.489882+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/supplier-ledger/2f62a619-47d3-453c-a040-994509e8d923	2026-03-07	1	2026-03-07 17:14:59.489882+00	\N
7c11e5a7-74ac-45dd-ae32-1bd9a706fe79	2026-03-07 16:31:40.99284+00	2026-03-07 16:31:40.99284+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/new-product-test	2026-03-07	5	2026-03-07 17:20:18.692325+00	\N
ef937029-8bc8-41b3-9be3-07b10fbaa208	2026-03-07 16:31:40.411718+00	2026-03-07 16:31:40.411718+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/new-product-test	2026-03-07	5	2026-03-07 17:20:17.9545+00	\N
c4dfe9dc-85a7-4a59-8601-aaeb76503112	2026-03-07 17:15:36.847919+00	2026-03-07 17:15:36.847919+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-07	28	2026-03-07 17:24:53.940078+00	\N
8c514dde-8345-4f0c-b1e3-deb70b3e5286	2026-03-07 18:06:50.29177+00	2026-03-07 18:06:50.29177+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/0b6944c6-f412-46b2-a85d-d06825d5a16d	2026-03-07	2	2026-03-07 18:09:19.323759+00	\N
03abfac1-ff29-4ede-b0fc-317aed89fddd	2026-03-07 18:03:25.302789+00	2026-03-07 18:03:25.302789+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/1ba59d00-e657-4f79-9643-4f090f2cf9bd	2026-03-07	3	2026-03-07 18:04:56.334171+00	\N
a061da30-5605-4057-99b4-58a1d7df5bda	2026-03-07 16:56:23.742167+00	2026-03-07 16:56:23.742167+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions	2026-03-07	32	2026-03-07 18:19:18.488211+00	\N
13137e4e-6c66-46af-bb59-a32a647d58eb	2026-03-07 14:15:31.522754+00	2026-03-07 14:15:31.522754+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-07	184	2026-03-07 18:25:52.536805+00	\N
63aaeba4-83c4-4444-97e9-48298ea65b7b	2026-03-07 14:23:47.686992+00	2026-03-07 14:23:47.686992+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-07	17	2026-03-07 18:25:48.642683+00	\N
51cd46d6-cca0-4545-996b-f6e83aa71c2b	2026-03-07 14:20:21.489555+00	2026-03-07 14:20:21.489555+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-07	13	2026-03-07 18:25:43.309267+00	\N
0d507db9-7584-4876-8d47-ea32a1aaabbe	2026-03-07 14:20:22.261886+00	2026-03-07 14:20:22.261886+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-07	14	2026-03-07 18:25:44.862434+00	\N
87864788-27ea-4ec4-a82e-0d31ec739834	2026-03-07 18:07:08.154866+00	2026-03-07 18:07:08.154866+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/test-offer	2026-03-07	16	2026-03-07 18:24:37.704386+00	\N
3726b6af-71d0-42ad-822d-e4478fcc5228	2026-03-07 14:15:31.522671+00	2026-03-07 14:15:31.522671+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-07	268	2026-03-07 18:25:52.536747+00	\N
50f65676-d7e2-4730-893e-73225fbb3663	2026-03-08 13:15:36.93441+00	2026-03-08 13:15:36.93441+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-08	26	2026-03-08 18:40:48.009773+00	\N
ba9cf384-6d31-45ed-912e-c81a799a09fb	2026-03-08 13:15:36.827409+00	2026-03-08 13:15:36.827409+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-08	98	2026-03-08 18:40:52.418748+00	\N
1ecb906b-691d-411f-bd4b-0183cb2ff953	2026-03-08 13:15:36.934255+00	2026-03-08 13:15:36.934255+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-08	50	2026-03-08 18:40:48.009707+00	\N
0eefea2d-6522-4345-bd72-562085779a3b	2026-03-11 14:00:03.973156+00	2026-03-11 14:00:03.973156+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-11	28	2026-03-11 16:34:57.851818+00	\N
1f7aa0af-e82d-42ab-b5aa-85c986cbc980	2026-03-08 15:11:01.990401+00	2026-03-08 15:11:01.990401+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-08	14	2026-03-08 18:40:55.276014+00	\N
18a523d1-f969-4e54-8bac-6a7aa5c8d836	2026-03-08 15:21:07.024618+00	2026-03-08 15:21:07.024618+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/14942467-ebc7-454a-b113-d8212187fb0a	2026-03-08	1	2026-03-08 15:21:07.024618+00	\N
77cdd50e-7b53-4b5b-93c2-d66e47dc464f	2026-03-08 15:11:21.725597+00	2026-03-08 15:11:21.725597+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/162f10a5-9e0e-42c2-9bf2-1ea2474149f4	2026-03-08	3	2026-03-08 15:21:11.30018+00	\N
bbf23b49-8dd9-4601-8f15-0559423715bf	2026-03-08 17:38:19.087322+00	2026-03-08 17:38:19.087322+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a9ab4467-fd5f-45bf-be9e-1291c3ed1a95	2026-03-08	3	2026-03-08 17:38:42.476109+00	\N
932c55e6-ef0b-4e96-bace-a81da7f1c47c	2026-03-08 17:34:10.612187+00	2026-03-08 17:34:10.612187+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-08	8	2026-03-08 18:12:32.65279+00	\N
64aa36e0-b57c-461b-b326-72ebefddff55	2026-03-08 17:34:26.387525+00	2026-03-08 17:34:26.387525+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-08	3	2026-03-08 18:13:05.593199+00	\N
bfbea6fa-8a5c-488f-a108-a6c8353b8a36	2026-03-08 17:34:26.397877+00	2026-03-08 17:34:26.397877+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-08	3	2026-03-08 18:13:05.604163+00	\N
f157ddb4-202c-45a6-9e11-9a85f075a6dd	2026-03-11 14:00:18.66543+00	2026-03-11 14:00:18.66543+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-11	138	2026-03-11 16:48:07.894185+00	\N
10060ef1-63c6-4035-b3d6-ca0549945180	2026-03-08 13:16:07.406533+00	2026-03-08 13:16:07.406533+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/test-offer	2026-03-08	2	2026-03-08 13:25:47.846033+00	\N
f85e05e3-fee0-4e57-8035-045fe089b3e3	2026-03-08 13:16:07.40039+00	2026-03-08 13:16:07.40039+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/undefined	2026-03-08	2	2026-03-08 13:25:47.846177+00	\N
aeb2d372-8eff-4f59-881b-ae35130855cf	2026-03-08 13:16:08.086444+00	2026-03-08 13:16:08.086444+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/test-offer	2026-03-08	2	2026-03-08 13:25:48.509512+00	\N
37dca14e-df09-45cf-abe5-4cf7aa937229	2026-03-11 14:00:22.624945+00	2026-03-11 14:00:22.624945+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-11	2	2026-03-11 14:15:05.992745+00	\N
21ac35a0-dbcb-45a3-9930-92392c74da73	2026-03-08 13:16:01.835243+00	2026-03-08 13:16:01.835243+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-08	5	2026-03-08 18:39:04.55385+00	\N
9c1c999d-f0ba-4fa0-ad15-8fc31a452970	2026-03-11 15:31:38.592273+00	2026-03-11 15:31:38.592273+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-11	14	2026-03-11 16:36:58.334891+00	\N
c29b666f-0850-46c2-806d-9c03e9ebf0e4	2026-03-08 17:38:18.816324+00	2026-03-08 17:38:18.816324+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-08	1	2026-03-08 17:38:18.816324+00	\N
627a8530-113c-4215-bf0c-449249be9dcc	2026-03-08 17:39:23.352963+00	2026-03-08 17:39:23.352963+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/cash-flow	2026-03-08	2	2026-03-08 17:39:23.369041+00	\N
48b83a97-fc32-4084-abbf-8568548366c8	2026-03-11 14:00:05.010738+00	2026-03-11 14:00:05.010738+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-11	53	2026-03-11 16:34:58.274802+00	\N
f9c9130a-c134-4ad9-b0e6-c5d2be0d3c8e	2026-03-08 13:16:02.593476+00	2026-03-08 13:16:02.593476+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-08	5	2026-03-08 18:39:05.286196+00	\N
23ea5496-08ab-46ba-84c5-9204018c7a36	2026-03-08 17:39:20.748006+00	2026-03-08 17:39:20.748006+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-08	4	2026-03-08 17:39:35.474379+00	\N
590f58eb-9e29-4be6-bbed-e61f51806c94	2026-03-08 18:39:06.226761+00	2026-03-08 18:39:06.226761+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-08	1	2026-03-08 18:39:06.226761+00	\N
2b5b0a71-2aa7-40e5-9ac1-b948fa49d47e	2026-03-11 14:00:05.049629+00	2026-03-11 14:00:05.049629+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-11	57	2026-03-11 16:34:58.312924+00	\N
b5cde751-be8b-428e-a552-c51814769b45	2026-03-08 17:39:18.265147+00	2026-03-08 17:39:18.265147+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/profit-loss	2026-03-08	4	2026-03-08 17:39:37.904057+00	\N
66e8d86d-672a-4998-8a7d-32a18894d794	2026-03-08 13:25:27.997221+00	2026-03-08 13:25:27.997221+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-08	353	2026-03-08 18:40:16.724925+00	\N
c4ae5111-397c-41ed-97a3-bf847e593550	2026-03-08 17:39:13.07302+00	2026-03-08 17:39:13.07302+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/finance-summary	2026-03-08	4	2026-03-08 17:39:39.105962+00	\N
ce9bec76-3c16-4736-a1ca-531da0991706	2026-03-11 14:01:25.505979+00	2026-03-11 14:01:25.505979+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-11	132	2026-03-11 16:48:08.022284+00	\N
577253ff-079d-45cc-969c-64f05880da2e	2026-03-08 15:11:23.43878+00	2026-03-08 15:11:23.43878+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-08	341	2026-03-08 18:40:16.906628+00	\N
a4d5a7f9-7321-44e6-b6c4-20146f0629ce	2026-03-08 13:15:48.099718+00	2026-03-08 13:15:48.099718+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-08	6	2026-03-08 18:37:15.283548+00	\N
8c8a9804-8212-46e9-b97b-43643960c309	2026-03-08 13:16:02.243095+00	2026-03-08 13:16:02.243095+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-08	353	2026-03-08 18:40:16.929502+00	\N
c64c6800-c915-4b44-8b0e-10a90a5dc5ee	2026-03-08 13:15:48.719903+00	2026-03-08 13:15:48.719903+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-08	6	2026-03-08 18:37:15.903235+00	\N
ff848cde-3311-41b9-8dd6-dc107461b75a	2026-03-08 13:25:28.610047+00	2026-03-08 13:25:28.610047+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-08	3	2026-03-08 17:36:52.805312+00	\N
e083b824-aaed-4822-9758-1706c8ce70d8	2026-03-08 13:25:27.997502+00	2026-03-08 13:25:27.997502+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-08	345	2026-03-08 18:40:17.002151+00	\N
c181214a-6a2a-4941-bceb-57772561cc13	2026-03-11 14:00:05.10389+00	2026-03-11 14:00:05.10389+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-11	21	2026-03-11 16:34:58.618195+00	\N
c076b44e-c274-4b22-be7e-b5053666040f	2026-03-08 15:25:38.725475+00	2026-03-08 15:25:38.725475+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/8aff1386-a6c6-4c19-af92-bf4e930a965b	2026-03-08	133	2026-03-08 18:40:28.62932+00	\N
8cbf47d2-8b2c-4c2a-a089-04e4b222e4e8	2026-03-08 13:15:35.918548+00	2026-03-08 13:15:35.918548+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-08	53	2026-03-08 18:40:47.08733+00	\N
44420e01-869d-46d2-9dfc-c2a3b119bbce	2026-03-08 13:15:36.71916+00	2026-03-08 13:15:36.71916+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-08	490	2026-03-08 18:40:47.73418+00	\N
dec215cd-f2a7-49db-9871-deb2b471a3dc	2026-03-08 13:15:36.851336+00	2026-03-08 13:15:36.851336+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-08	90	2026-03-08 18:40:47.79594+00	\N
13ecb4d0-7fe5-4e54-932a-ab68e9cc0770	2026-03-11 14:00:05.103826+00	2026-03-11 14:00:05.103826+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-11	27	2026-03-11 16:34:58.618137+00	\N
19a004d4-6587-4f69-aedc-616a89c49711	2026-03-11 14:34:49.920147+00	2026-03-11 14:34:49.920147+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-11	2	2026-03-11 15:08:19.871657+00	\N
95e36305-a398-46b1-9765-5005ea50189b	2026-03-11 14:38:09.938328+00	2026-03-11 14:38:09.938328+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-11	2	2026-03-11 15:08:27.777544+00	\N
4e94fecc-9edc-4ec0-8ba2-1ee1595ccc37	2026-03-11 14:01:25.539707+00	2026-03-11 14:01:25.539707+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-11	132	2026-03-11 16:48:08.096652+00	\N
7e3f7901-ded8-4415-bdfb-8490cc3939ca	2026-03-11 14:00:04.900844+00	2026-03-11 14:00:04.900844+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-11	182	2026-03-11 16:48:08.110636+00	\N
734dd409-3ed4-4ebe-9748-041444b4520c	2026-03-12 12:53:32.141815+00	2026-03-12 12:53:32.141815+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-12	83	2026-03-12 17:43:17.326242+00	\N
93aa021a-927e-48e0-a12d-6556ed45b3dc	2026-03-12 12:54:01.597271+00	2026-03-12 12:54:01.597271+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-12	165	2026-03-12 17:44:08.684778+00	\N
f2cc289e-ef53-47dd-875d-4f72bf982e8f	2026-03-11 14:38:09.954809+00	2026-03-11 14:38:09.954809+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-11	2	2026-03-11 15:08:27.785147+00	\N
472d184c-12bf-4b5d-a031-a77b671115db	2026-03-11 14:00:22.014492+00	2026-03-11 14:00:22.014492+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-11	2	2026-03-11 14:15:05.319388+00	\N
22f3a259-5cf4-4172-8600-09547e14493b	2026-03-11 14:00:19.297145+00	2026-03-11 14:00:19.297145+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-11	2	2026-03-11 14:15:40.842149+00	\N
aa546322-27cf-4415-a7b5-efc3d6756b21	2026-03-11 14:00:18.666889+00	2026-03-11 14:00:18.666889+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-11	136	2026-03-11 16:48:08.127807+00	\N
9eec2dfb-86a2-4ab7-b7d2-87670ab71141	2026-03-12 12:54:34.264261+00	2026-03-12 12:54:34.264261+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-12	70	2026-03-12 17:35:46.475207+00	\N
1e5465a8-3ea5-45c6-8c58-c7f9b0d06743	2026-03-11 14:00:57.923675+00	2026-03-11 14:00:57.923675+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-11	8	2026-03-11 15:26:49.084077+00	\N
93fe4dec-c48d-4cc8-84c1-12433e8099da	2026-03-11 14:01:09.829893+00	2026-03-11 14:01:09.829893+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/8aff1386-a6c6-4c19-af92-bf4e930a965b	2026-03-11	27	2026-03-11 15:08:34.394966+00	\N
57f4b894-d30b-459d-b230-f82b5f56594a	2026-03-11 14:00:03.895999+00	2026-03-11 14:00:03.895999+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-11	33	2026-03-11 16:34:40.258955+00	\N
80207f9f-e7cf-439f-91d9-583d6256baae	2026-03-12 12:53:49.042681+00	2026-03-12 12:53:49.042681+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-12	16	2026-03-12 17:35:35.269395+00	\N
2eebc8c8-7f19-46ab-abb1-b73374b0db09	2026-03-12 12:53:32.228366+00	2026-03-12 12:53:32.228366+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-12	103	2026-03-12 17:43:17.353431+00	\N
7b8a6b59-6fde-469d-beea-51e22a4daa15	2026-03-12 12:54:34.239364+00	2026-03-12 12:54:34.239364+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-12	93	2026-03-12 17:35:46.329745+00	\N
f4fcab3d-07fd-4920-b2e7-d00a10e25d5b	2026-03-12 12:53:33.286853+00	2026-03-12 12:53:33.286853+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-12	125	2026-03-12 17:43:19.859464+00	\N
a63e3fb9-9918-4384-ab6e-dcce4878f462	2026-03-12 12:53:33.097058+00	2026-03-12 12:53:33.097058+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-12	160	2026-03-12 17:43:19.714692+00	\N
fbc241b7-0128-458d-80df-081fa7606543	2026-03-12 12:54:34.204782+00	2026-03-12 12:54:34.204782+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-12	192	2026-03-12 17:43:19.586874+00	\N
80f7da72-c11d-4fea-9fb2-376363a685f1	2026-03-13 02:09:22.56938+00	2026-03-13 02:09:22.56938+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-13	105	2026-03-13 09:50:44.393593+00	\N
c34c5edd-12a6-41fb-9743-3f5845b314f2	2026-03-12 14:02:02.211982+00	2026-03-12 14:02:02.211982+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-12	6	2026-03-12 14:25:26.681906+00	\N
30307a7d-d6ff-4cb2-8f3e-8f3c473f4b93	2026-03-13 02:19:21.804426+00	2026-03-13 02:19:21.804426+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-13	3	2026-03-13 09:11:43.777458+00	\N
025d5c37-375a-43b3-ad9d-d48f3772047b	2026-03-13 02:09:39.789303+00	2026-03-13 02:09:39.789303+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-13	20	2026-03-13 09:36:24.662258+00	\N
6c72c8bf-ae3f-413a-94a7-ceab0360acaf	2026-03-13 02:09:39.826434+00	2026-03-13 02:09:39.826434+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-13	20	2026-03-13 09:36:24.703076+00	\N
aad9d935-41da-4e9b-80da-272334fca7d2	2026-03-14 13:06:32.970439+00	2026-03-14 13:06:32.970439+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-14	1	2026-03-14 13:06:32.970439+00	\N
276f3417-a533-41d5-91e1-ee7fbb32297e	2026-03-13 09:40:02.5735+00	2026-03-13 09:40:02.5735+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-13	1	2026-03-13 09:40:02.5735+00	\N
6279a235-abf2-4105-a04f-296be6391483	2026-03-13 02:09:21.300138+00	2026-03-13 02:09:21.300138+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-13	73	2026-03-13 09:40:04.181564+00	\N
f0b7490f-4d85-4a73-b8ee-ee8cb3cbe234	2026-03-14 13:06:32.88946+00	2026-03-14 13:06:32.88946+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-14	3	2026-03-14 13:06:34.017705+00	\N
e488b6ba-170b-447e-8ef1-6d83de2d41b0	2026-03-13 09:30:25.21701+00	2026-03-13 09:30:25.21701+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/public	2026-03-13	1191	2026-03-13 09:32:49.065568+00	\N
7b6ba6af-773c-4ac2-b77a-4ce1b0f75b69	2026-03-12 17:02:28.329148+00	2026-03-12 17:02:28.329148+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-12	2	2026-03-12 17:02:28.411178+00	\N
dccc82d0-724d-4116-bc6a-d34e2aa09748	2026-03-12 17:02:28.420549+00	2026-03-12 17:02:28.420549+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-12	2	2026-03-12 17:02:28.463765+00	\N
c994196e-7088-4800-a67f-a92f7f8d708e	2026-03-13 02:09:22.538509+00	2026-03-13 02:09:22.538509+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-13	4	2026-03-13 02:11:02.894953+00	\N
02bc87a5-9d45-40ab-a64f-9ddf41f9b2ca	2026-03-13 02:11:06.2702+00	2026-03-13 02:11:06.2702+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-13	2	2026-03-13 02:11:06.280452+00	\N
6ad8ce4d-ae13-44b5-ab5e-a88decf1fa0f	2026-03-12 14:37:29.470216+00	2026-03-12 14:37:29.470216+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-12	1	2026-03-12 14:37:29.470216+00	\N
89c9c85e-6024-49e1-8fe9-da4177c7a387	2026-03-12 14:37:30.253403+00	2026-03-12 14:37:30.253403+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-12	1	2026-03-12 14:37:30.253403+00	\N
095133af-8f3a-48a7-8bbf-1657e34acf16	2026-03-12 15:16:50.591926+00	2026-03-12 15:16:50.591926+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-12	6	2026-03-12 17:31:35.479465+00	\N
a7eb7a3a-bc35-4704-9aea-c411ce780b5c	2026-03-12 13:13:46.826688+00	2026-03-12 13:13:46.826688+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-12	15	2026-03-12 16:54:36.074617+00	\N
426f0dab-bbcb-4984-b87e-9424c2547173	2026-03-12 15:39:37.525405+00	2026-03-12 15:39:37.525405+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-12	11	2026-03-12 17:34:16.555561+00	\N
7d9d4877-c15a-419a-9b73-a9e3c9a38c89	2026-03-12 15:42:58.452357+00	2026-03-12 15:42:58.452357+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-12	5	2026-03-12 17:35:34.833109+00	\N
b3b4fed1-3f25-4fa6-92cc-089f95396212	2026-03-12 13:51:48.195155+00	2026-03-12 13:51:48.195155+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-12	2	2026-03-12 17:08:21.5526+00	\N
1f022be5-5786-46b9-94d6-8e8c8437de52	2026-03-12 15:42:58.46296+00	2026-03-12 15:42:58.46296+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-12	5	2026-03-12 17:35:34.843881+00	\N
fdad7975-ddbd-4455-8c28-fbe4f74358f1	2026-03-13 02:09:32.553662+00	2026-03-13 02:09:32.553662+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-13	160	2026-03-13 09:40:04.644033+00	\N
b1df7339-d85e-486f-9ca2-7a25dc8e1f93	2026-03-13 02:09:19.683811+00	2026-03-13 02:09:19.683811+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-13	120	2026-03-13 09:40:04.664482+00	\N
197675e2-094c-41ce-b36c-0945dc8f969e	2026-03-13 02:09:32.668449+00	2026-03-13 02:09:32.668449+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-13	164	2026-03-13 09:40:04.668833+00	\N
7d83c6ae-cad6-4a30-ad2b-236d4baf8074	2026-03-14 13:06:34.309321+00	2026-03-14 13:06:34.309321+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-14	2	2026-03-14 13:06:34.688786+00	\N
1c0543a6-7389-4e9c-a474-844ee3c61637	2026-03-12 14:02:16.739315+00	2026-03-12 14:02:16.739315+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/86056f63-c0ea-41f7-87fc-3a63f3b055f9	2026-03-12	1	2026-03-12 14:02:16.739315+00	\N
b1074e07-158a-40c6-ac44-dd6c17535ddf	2026-03-12 12:54:34.279728+00	2026-03-12 12:54:34.279728+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-12	142	2026-03-12 17:35:46.492523+00	\N
1166d8b2-8632-401f-a01d-d9350f984138	2026-03-14 13:06:34.417788+00	2026-03-14 13:06:34.417788+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-14	2	2026-03-14 13:06:34.69688+00	\N
bc2be399-89b3-4fe4-a215-73c55b24d85b	2026-03-12 12:54:34.309471+00	2026-03-12 12:54:34.309471+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-12	154	2026-03-12 17:43:19.643757+00	\N
bdd63b22-72d6-43aa-8dcd-339a76a65d88	2026-03-14 13:06:34.190759+00	2026-03-14 13:06:34.190759+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-14	4	2026-03-14 13:06:34.706685+00	\N
179bdcd2-874f-4a12-9fbf-8779be2facfc	2026-03-12 12:53:33.06922+00	2026-03-12 12:53:33.06922+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-12	158	2026-03-12 17:43:19.704172+00	\N
95f151ae-e57f-4343-b666-0ff4d5bf7f12	2026-03-12 12:53:33.286913+00	2026-03-12 12:53:33.286913+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-12	95	2026-03-12 17:43:19.859493+00	\N
61df7aff-5932-416c-a848-d8ef24c6dd0e	2026-03-12 14:02:02.80442+00	2026-03-12 14:02:02.80442+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-12	3	2026-03-12 14:08:04.21781+00	\N
489e6ea3-2523-4f30-b4b4-10f6aa096376	2026-03-14 13:06:34.660024+00	2026-03-14 13:06:34.660024+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-14	2	2026-03-14 13:06:34.738193+00	\N
7ee3e740-b623-4306-808a-3debfc7ec907	2026-03-13 02:09:28.397382+00	2026-03-13 02:09:28.397382+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-13	128	2026-03-13 09:40:04.747142+00	\N
c6557c74-0f81-4a64-9425-6ded1f7714d7	2026-03-13 02:15:12.546046+00	2026-03-13 02:15:12.546046+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-13	30	2026-03-13 09:40:04.803317+00	\N
942dcd2e-ac16-4eea-be77-9e3b354d1539	2026-03-13 02:15:12.546093+00	2026-03-13 02:15:12.546093+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-13	26	2026-03-13 09:40:04.803355+00	\N
18894cac-13e7-4c04-86c2-9306bf698bb1	2026-03-13 02:09:32.303334+00	2026-03-13 02:09:32.303334+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-13	96	2026-03-13 09:40:30.960382+00	\N
9b1108a5-ad07-4b55-8e38-c705f07ce750	2026-03-14 13:06:34.768023+00	2026-03-14 13:06:34.768023+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-14	2	2026-03-14 13:06:34.7898+00	\N
edc8a5f7-0402-448c-9754-93eea3837f0b	2026-03-13 02:09:39.854799+00	2026-03-13 02:09:39.854799+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-13	113	2026-03-13 09:40:44.441235+00	\N
f954f47d-4911-48cf-8287-c8f417491941	2026-03-13 02:19:21.113552+00	2026-03-13 02:19:21.113552+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-13	3	2026-03-13 09:11:43.071626+00	\N
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, title, slug, is_home_page, "order", sections, meta_title, meta_description, typography, status, tenant_id, created_at, updated_at, user_id) FROM stdin;
a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	Home-page	/	t	0	[{"id": "block-1csljz174", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-71dtmiesq", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "100%", "marginLeft": "", "paddingTop": 0, "gridColumns": 1, "marginRight": "", "paddingLeft": "", "layoutPreset": "container-full", "paddingRight": "", "mobileDisplay": "flex", "paddingBottom": 0, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": ""}, "children": [{"id": "block-kvvcy2pxp", "type": "banner", "styles": {"height": "600px", "opacity": 1, "fontSize": "", "marginTop": "", "textAlign": "center", "textColor": "#3e1e1e", "paddingTop": "10px", "borderColor": "", "borderStyle": "", "borderWidth": "", "buttonColor": "#e63333", "paddingLeft": "20px", "borderRadius": "", "mobileHeight": "600px", "paddingRight": "20px", "sublineColor": "rgba(255, 255, 255, 0.9)", "headlineColor": "#aa7474", "paddingBottom": "10px", "overlayOpacity": 37, "backgroundColor": "", "buttonTextColor": "#2563eb"}, "disabled": false, "settings": {"slides": [{"id": "block-ozm2gsq7b", "subline": "Discover the latest trends in luxury fashion and accessories.", "headline": "Summer Collection 2026", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", "primaryButtonLink": "/products", "primaryButtonText": "Shop Now", "secondaryButtonLink": "/about", "secondaryButtonText": "Learn More"}, {"id": "item-1773330350985", "subline": "Discover the latest trends in luxury fashion and accessories.", "headline": "New Slide", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", "primaryButtonLink": "/products", "primaryButtonText": "Shop Now"}]}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-xvqzc0qs1", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-urasaqhg7", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "1280px", "position": "", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "paddingLeft": "", "layoutPreset": "grid", "paddingRight": "", "mobileDisplay": "grid", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileFlexDirection": "", "mobileJustifyContent": "center", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-3h4id3guw", "type": "product-slider", "styles": {"textAlign": "left", "paddingTop": 0, "paddingBottom": 0, "mobileTextAlign": "left", "mobilePaddingLeft": "", "mobilePaddingRight": ""}, "disabled": false, "settings": {"source": "all", "columns": 3, "headline": "Featured Product", "collectionId": "3da1ebc3-b228-41a3-926b-0f7db1df7419", "mobileColumns": 1}}, {"id": "block-721pt0nv8", "type": "category-grid", "styles": {"textAlign": "center", "cardBorder": "none", "paddingTop": 0, "paddingBottom": 0, "mobileTextAlign": "center"}, "disabled": false, "settings": {"count": 10, "items": [], "title": "All Categoris", "source": "all", "columns": 4, "mobileColumns": 2}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-kk82rkly6", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-za4qj53bv", "type": "row", "styles": {"display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "layoutPreset": "grid", "paddingBottom": 0, "gridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-t7dt5hxlq", "type": "brand-grid", "styles": {"textAlign": "center", "cardShadow": "none", "paddingTop": "", "paddingBottom": "50px", "backgroundColor": "#f5efef", "cardBackgroundColor": "#e10e0e"}, "disabled": false, "settings": {"title": "Shop by Barnd", "columns": 3, "mobileColumns": 1}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-554cz8uco", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-tnkox5lcl", "type": "row", "styles": {"display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "layoutPreset": "grid", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-yrzicn7p7", "type": "newsletter", "styles": {"textAlign": "center", "paddingTop": "10px", "marginBottom": "1px", "paddingBottom": "14px"}, "disabled": false, "settings": {"title": "Join our Newletter", "description": "Get to update news"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-tevefx1hd", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-u0utjl9bd", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "paddingLeft": "", "layoutPreset": "grid", "paddingRight": "", "mobileDisplay": "grid", "paddingBottom": 0, "backgroundColor": "#f4ebeb", "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-wvrxw003y", "type": "stats-counter", "styles": {"textAlign": "center", "cardBorder": "medium", "cardRadius": "101px", "cardShadow": "medium", "fontWeight": "500", "paddingTop": "10px", "paddingBottom": "10px", "cardBackgroundColor": "#d32727"}, "disabled": false, "settings": {"items": [{"id": "item-1773335785755", "label": "New Stat", "value": "100+"}, {"id": "item-1773336223030", "label": "New Stat", "value": "100+"}, {"id": "item-1773336236006", "label": "New Stat", "value": "100+"}, {"id": "item-1773336389601", "label": "New Stat", "value": "100+"}], "title": "Statas Overview", "subline": "dddd"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-1ulyx2ddb", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-9n0b56ix3", "type": "row", "styles": {"width": "100%", "display": "block", "maxWidth": "100%", "marginLeft": "", "paddingTop": 0, "gridColumns": 1, "marginRight": "", "paddingLeft": "", "layoutPreset": "container-full", "paddingRight": "", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-4fd3aukuw", "type": "offer-banner", "styles": {"textAlign": "right", "paddingTop": "50px", "buttonColor": "#ea3434", "paddingLeft": "", "mobileHeight": "", "paddingBottom": "50px", "overlayOpacity": 100, "buttonTextColor": "#708cc7", "mobilePaddingTop": "", "mobilePaddingLeft": "", "mobilePaddingBottom": ""}, "disabled": false, "settings": {"layout": "left", "endDate": "2026-03-13T04:31:00.000Z", "headline": "New Offers", "buttonLink": "dddddd", "buttonText": "eeeeee", "backgroundImage": "", "secondaryButtonLink": "sdfasdf", "secondaryButtonText": "eee"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-hmc4hyra3", "type": "review-slider", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-f0138mu76", "type": "text-block", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-e5x29x3fn", "type": "image-block", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-j065dqjl9", "type": "button", "styles": {"height": "", "textColor": "#4b3535", "fontWeight": "600", "paddingTop": "15px", "borderColor": "#f4ecec", "borderStyle": "dashed", "borderWidth": "10px", "buttonColor": "#da2f2f", "paddingBottom": "15px", "textTransform": "uppercase", "backgroundColor": "#bf7878"}, "disabled": false, "settings": {}}, {"id": "block-cege6sbts", "type": "divider", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {"style": "dashed"}}, {"id": "block-9troct5ch", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-rjd3r26vq", "type": "row", "styles": {"width": "100%", "display": "block", "maxWidth": "100%", "marginLeft": "", "paddingTop": 0, "gridColumns": 1, "marginRight": "", "paddingLeft": "", "layoutPreset": "container-full", "paddingRight": "", "paddingBottom": 0, "gridTemplateColumns": ""}, "children": [{"id": "block-uk1n6101v", "type": "faq-section", "styles": {"textAlign": "center", "textColor": "#0d0c0c", "paddingTop": 0, "headlineColor": "#343232", "paddingBottom": 0}, "disabled": false, "settings": {"items": [{"id": "item-1773374310151", "answer": "Answer goes herew", "question": "New Question"}, {"id": "item-1773374313856", "answer": "Answer goes herew", "question": "New Question"}, {"id": "item-1773374316551", "answer": "Answer goes herew", "question": "New Question"}], "title": "Fap", "layout": "accordion", "subline": "eeeeeeee", "gridColumns": "2", "mobileColumns": "1"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-x824aliac", "type": "contact", "styles": {"textAlign": "center", "labelAlign": "left", "paddingTop": 0, "titleAlign": "left", "buttonColor": "#e63d3d", "sublineColor": "#de8c8c", "headlineColor": "#f01919", "paddingBottom": 0, "backgroundColor": "#eebfbf", "inputBorderColor": "#e7d9d9"}, "disabled": false, "settings": {"cardLayout": "right"}}, {"id": "block-v9evykq6w", "type": "new-arrivals", "styles": {"paddingTop": 0, "paddingBottom": 0}, "settings": {"source": "all", "mobileColumns": 2}}]			{"headingFontFamily": "Inter", "headingFontWeight": "800", "paragraphFontSize": ""}	published	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-11 15:31:37.871705+00	2026-03-13 09:39:30.137291+00	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, user_id, transaction_id, amount, currency, method, status, gateway_response, tenant_id, created_at, updated_at) FROM stdin;
0f27049e-ac9e-4523-9932-e8ebcdc2a509	cf65241e-b924-478c-ae13-a93f2bb1e6e9	\N	MANUAL_COD_1772471493159	900.00	USD	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02 17:11:33.162328+00	2026-03-02 17:11:33.162328+00
5772aa75-3405-4d43-9583-fe91a7741cfd	1b9965b4-5557-4f0e-b3f4-cd9d16df1182	\N	MANUAL_COD_1772471501488	1800.00	USD	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02 17:11:41.490745+00	2026-03-02 17:11:41.490745+00
e9c16aa0-f6aa-4809-9acc-517e18ba64f0	7d40c6f1-899d-4879-b1bc-b938478d8409	\N	MANUAL_COD_1772725611196	9000.00	BDT	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 15:46:51.196251+00	2026-03-05 15:46:51.196251+00
ab7f7077-cbf0-4ef0-aac6-856daf580640	a47ba302-b6ae-46b2-894d-54179ac76c4e	\N	MANUAL_COD_1772733561240	549.00	BDT	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 17:59:21.24004+00	2026-03-05 17:59:21.24004+00
00bb06e5-2b1c-424b-8bff-5a4a8e93d310	cda460d8-7598-42df-b4bf-780bd14c8a08	\N	MANUAL_COD_1772801813252	1298.00	BDT	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-06 12:56:53.251624+00	2026-03-06 12:56:53.251624+00
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, brand_name, brand_logo, support_email, hero, features, footer, updated_at, created_at, user_id) FROM stdin;
61169b46-2b97-4e42-9618-7a94363ad9a6	YourSaaS		support@yoursaas.com	{"badge": "Next-Gen eCommerce Platform", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", "title": "Launch Your Store in Seconds, Not Days", "description": "The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.", "primaryBtnLink": "/create-store", "primaryBtnText": "Start Your Free Trial", "secondaryBtnLink": "#", "secondaryBtnText": "Watch Demo"}	[{"icon": "Globe", "title": "Multi-Tenant", "description": "Run separate stores for different brands or regions with isolated data."}, {"icon": "Zap", "title": "Instant Deployment", "description": "New stores are live in seconds with their own subdomain automatically."}, {"icon": "Shield", "title": "Secure Payments", "description": "Pre-integrated with SSLCommerz and more for secure transactions."}, {"icon": "BarChart3", "title": "Global Analytics", "description": "Monitor sales and customer behavior across all your stores."}, {"icon": "Users", "title": "User Management", "description": "Role-based access control for your team and store administrators."}, {"icon": "Target", "title": "SEO Optimized", "description": "Built-in SEO tools to help your products rank higher in search results."}]	{"socials": {"twitter": "#", "facebook": "#", "linkedin": "#", "instagram": "#"}, "copyright": "© 2024 YourSaaS. All rights reserved.", "description": "The ultimate multi-tenant eCommerce platform."}	2026-02-23 16:04:36.652881+00	2026-02-25 15:08:53.816738+00	\N
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, name, "values", product_id, tenant_id, created_at, updated_at, user_id) FROM stdin;
923466c7-c5a3-40df-907e-5f15bdddc7ff	Size	md,sm,xl	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.49885+00	2026-03-01 12:59:46.49885+00	\N
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, sku, price, stock, images, combination, product_id, tenant_id, created_at, updated_at, user_id, low_stock_threshold) FROM stdin;
bea456ab-c588-464c-88eb-609919b1d8b2	SKU-CZ6OSHMO8	1000.00	600	\N	{"Size": "xl"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-01 12:59:46.502367+00	\N	5
5179bc44-ae7e-4c4e-8745-62e018ad83e8	SKU-3R8FD3EL5	1000.00	600	\N	{"Size": "md"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-05 15:40:03.552689+00	\N	5
80b5fca1-5ed4-4f21-8eae-1d815126418f	SKU-0AYXCVZ86	1000.00	600	\N	{"Size": "sm"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-05 15:46:42.323116+00	\N	5
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, short_description, price, is_review, discount_amount, images, stock, status, category_id, brand_id, landing_page_id, faq_source, faq_ids, tenant_id, created_at, updated_at, supplier_id, user_id, low_stock_threshold) FROM stdin;
25e3ab42-6ac3-4a38-b773-aca27a2a5514	new product test	new-product-test	<p>asdfasdf</p>		1000.00	t	100.00	http://localhost:3900/uploads/1772363368735_gowtam.jpg	600	active	4d13c2cd-a72a-4b25-94d6-2fc8d1a2b786	ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	\N	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.491235+00	2026-03-01 12:59:46.491235+00	\N	\N	5
6049be83-338f-4f1d-a0fb-e748b77eea6c	Starship Full Cream Milk Powder - 1kg	starship-full-cream-milk-powder-1kg	<ul><li><p>Product type: Milk Powder</p></li><li><p>Capacity: 1000gm</p></li><li><p>Brand: Starship</p></li></ul><ul><li><p>Starship Full Cream Milk Powder - 1kg</p></li></ul><ul><li><p>Product type: Milk Powder</p></li><li><p>Capacity: 1000gm.</p></li><li><p>Brand: Starship</p></li></ul><p></p>	Brand: Starship\n\n\n\n\n\nStarship Full Cream Milk Powder - 1kg	659.00	t	65.90	http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp,http://localhost:3900/uploads/1772471380322_imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg	97	active	\N	ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	a9ab4467-fd5f-45bf-be9e-1291c3ed1a95	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02 16:35:44.686932+00	2026-03-08 17:38:18.827531+00	\N	\N	5
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, created_at, updated_at, name, description, "promotionType", value, "targetType", target_id, min_order_value, start_date, end_date, is_active, tenant_id, user_id, slug) FROM stdin;
0b6944c6-f412-46b2-a85d-d06825d5a16d	2026-03-07 18:05:28.880521+00	2026-03-07 18:09:19.325764+00	test offer	ddd	percentage	10.00	specific_product	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	2026-03-07 00:00:00	2026-03-12 00:00:00	t	e70063fd-c5b4-458b-a139-6130f2515580	\N	test-offer
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, created_at, updated_at, purchase_order_id, product_id, quantity, unit_price, variant_id, user_id) FROM stdin;
1f5c93d5-d023-4a37-839a-30fd70fbb0cb	2026-03-04 17:44:32.660718+00	2026-03-04 17:44:32.660718+00	b1ad4dbe-cbd1-4e27-9645-aea39f740918	6049be83-338f-4f1d-a0fb-e748b77eea6c	1	659.00	\N	\N
b4d85c37-0761-434c-9e74-d09d38fbbae1	2026-03-04 18:44:54.295996+00	2026-03-04 18:44:54.295996+00	e57e5892-31ff-4016-8a89-1f05d6fc6309	25e3ab42-6ac3-4a38-b773-aca27a2a5514	10	1000.00	80b5fca1-5ed4-4f21-8eae-1d815126418f	\N
773d2b61-84d6-4cfe-805e-3318f5757b90	2026-03-04 18:51:18.456821+00	2026-03-04 18:51:18.456821+00	7dab6627-7bbe-44b3-8f61-6c09f0291013	25e3ab42-6ac3-4a38-b773-aca27a2a5514	10	1000.00	5179bc44-ae7e-4c4e-8745-62e018ad83e8	\N
21ca1319-4055-4773-8b3a-9c812cf9e540	2026-03-05 15:40:00.640934+00	2026-03-05 15:40:00.640934+00	2a38347c-37cc-4178-857f-2de233c4ab34	25e3ab42-6ac3-4a38-b773-aca27a2a5514	3	1000.00	5179bc44-ae7e-4c4e-8745-62e018ad83e8	\N
c2a39a57-e658-40f7-85b2-bdd10f8e277b	2026-03-05 15:42:40.945913+00	2026-03-05 15:42:42.776556+00	8f803440-73e5-49f1-94e9-9e0b4d3076b1	6049be83-338f-4f1d-a0fb-e748b77eea6c	2	659.00	\N	\N
d9721f45-445f-4c95-8763-1fefbe7b6a57	2026-03-05 15:44:28.514091+00	2026-03-05 15:44:28.514091+00	6b9378ed-3393-49c6-9624-4343621967a8	25e3ab42-6ac3-4a38-b773-aca27a2a5514	10	1000.00	80b5fca1-5ed4-4f21-8eae-1d815126418f	\N
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, created_at, updated_at, reference_number, supplier_id, status, total_amount, tenant_id, payment_status, paid_amount, user_id) FROM stdin;
b1ad4dbe-cbd1-4e27-9645-aea39f740918	2026-03-04 17:44:32.660718+00	2026-03-04 17:44:39.209004+00	PO-201061	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	659.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
e57e5892-31ff-4016-8a89-1f05d6fc6309	2026-03-04 18:44:54.295996+00	2026-03-04 18:45:42.271799+00	PO-854591	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
7dab6627-7bbe-44b3-8f61-6c09f0291013	2026-03-04 18:51:18.456821+00	2026-03-04 18:51:20.98374+00	PO-264141	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
2a38347c-37cc-4178-857f-2de233c4ab34	2026-03-05 15:40:00.640934+00	2026-03-05 15:40:03.541844+00	PO-120247	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	3000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
8f803440-73e5-49f1-94e9-9e0b4d3076b1	2026-03-05 15:42:40.945913+00	2026-03-05 15:42:42.776556+00	PO-329141	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	1318.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
6b9378ed-3393-49c6-9624-4343621967a8	2026-03-05 15:44:28.514091+00	2026-03-05 16:28:09.391751+00	PO-455751	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PARTIAL	1000.00	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, customer_name, customer_email, rating, comment, status, tenant_id, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, logo, brand_name, site_description, contact_email, contact_phone, whatsapp_phone, address, currency, currency_symbol, supported_currencies, social_links, marketing, smtp, payment, pathao_courier, steadfast_courier, navbar, trust_badges, tenant_id, created_at, updated_at, user_id, footer) FROM stdin;
bee53502-484f-428a-8915-f2eacfad341e	\N	poly	Welcome to poly! Premium products and excellent service.	poly@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:25.936659+00	2026-03-02 16:37:25.940507+00	\N	\N
0351163b-695f-4ba3-8bfa-60596acd01cf	http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp	gowtam	Welcome to gowtam! Premium products and excellent service.	gowtam@gmail.com	+8801767163576	+8801767163576	Jhikaracha,Jashore	BDT	৳	[{"code": "BDT", "name": "BDT", "rate": 1, "symbol": "৳"}, {"code": "USD", "name": "USD", "rate": 120, "symbol": "$"}]	{"twitter": "https://www.linkedin.com/feed/", "facebook": "https://www.linkedin.com/feed/", "linkedin": "https://www.linkedin.com/feed/", "instagram": "https://www.linkedin.com/feed/"}	{"facebookPixelId": "", "googleAnalyticsId": "", "googleSiteVerification": "", "facebookDomainVerification": ""}	{"from": "", "host": "", "pass": "", "port": 587, "user": "", "secure": false}	{"stripeSecretKey": "", "sslCommerzStoreId": "", "sslCommerzIsSandbox": false, "stripePublishableKey": "", "sslCommerzStorePassword": ""}	{"sandboxMode": false, "pathaoStoreId": "", "pathaoClientId": "", "pathaoPassword": "", "pathaoUsername": "", "pathaoClientSecret": ""}	{"apiKey": "", "secretKey": ""}	{"links": [{"href": "/", "label": "Home", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Shop", "order": 1, "isActive": true, "isOpenInNewTab": false}], "layout": "default", "sticky": true, "maxWidth": "standard", "template": "glass", "textColor": "", "bottomShape": "none", "hoverEffect": "background", "transparent": false, "borderRadius": "none", "backgroundColor": "#f5f5f5", "shadowIntensity": "none", "backgroundPattern": "none"}	[]	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:54:11.672721+00	2026-03-13 04:26:44.834785+00	\N	{"columns": "4", "sections": [{"links": [{"href": "/products", "label": "All Products", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products?sort=newest", "label": "Hot Releases", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Flash Sales", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 0, "title": "Shop Categories"}, {"links": [{"href": "/profile", "label": "Track Order", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Help Center", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/privacy", "label": "Return Policy", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 1, "title": "Support"}, {"links": [{"href": "/", "label": "test-1", "order": 0, "isActive": true, "isOpenInNewTab": false}], "order": 2, "title": "new section"}], "template": "modern", "topShape": "none", "copyright": "© 2026 gowtam. Made with Heart by Gowtam Kumar.", "textColor": "#f8fafc", "brandColor": "", "borderColor": "", "description": "Elevating your daily experience with premium sound and state-of-the-art design.", "glassEffect": false, "borderRadius": "none", "showNewsletter": true, "backgroundColor": "#0f172a", "shadowIntensity": "none", "showSocialLinks": true, "backgroundPattern": "none"}
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, is_active, created_at, updated_at, user_id) FROM stdin;
09a1a643-e095-47d2-84e2-63b60e59d4ec	gowtampaula0@gmail.com	t	2026-03-07 17:22:23.195927+00	2026-03-07 17:22:23.195927+00	\N
eaa6ffcd-4f1f-4961-8260-0c69ea15ae2b	gowtampaul01@gmail.com	t	2026-03-07 17:24:44.6156+00	2026-03-07 17:24:44.6156+00	\N
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, description, price, features, is_active, created_at, updated_at, user_id) FROM stdin;
49d2a11a-bf12-4cb4-a136-1ac8ac3addec	Basic	dddd	5.00	[]	t	2026-02-27 04:55:37.050021+00	2026-02-27 06:26:16.85176+00	\N
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, created_at, updated_at, purchase_order_id, supplier_id, amount, payment_date, payment_method, transaction_id, note, tenant_id, user_id) FROM stdin;
28da9976-f338-4b28-9238-cf29cade1ef7	2026-03-05 16:23:08.013421+00	2026-03-05 16:23:08.013421+00	6b9378ed-3393-49c6-9624-4343621967a8	2f62a619-47d3-453c-a040-994509e8d923	100.00	2026-03-05 16:23:08.011	Cash	444	fasdfasdf	e70063fd-c5b4-458b-a139-6130f2515580	\N
c96daaf5-c766-413e-98e0-91c2ba2f956c	2026-03-05 16:27:40.368136+00	2026-03-05 16:27:40.368136+00	6b9378ed-3393-49c6-9624-4343621967a8	2f62a619-47d3-453c-a040-994509e8d923	100.00	2026-03-05 16:27:40.379	Cash	444	fasdfasdf	e70063fd-c5b4-458b-a139-6130f2515580	\N
e2944d2f-6733-4f5c-b40b-7a2e509ecbf0	2026-03-05 16:28:09.391751+00	2026-03-05 16:28:09.391751+00	6b9378ed-3393-49c6-9624-4343621967a8	2f62a619-47d3-453c-a040-994509e8d923	900.00	2026-03-05 16:28:09.397	Cash	554	dasdfasdf	e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, created_at, updated_at, name, contact_name, email, phone, address, tenant_id, user_id) FROM stdin;
2f62a619-47d3-453c-a040-994509e8d923	2026-03-04 17:42:45.402899+00	2026-03-04 17:42:45.402899+00	Gowtam	Gowtam	gowtampaul0@gmail.com	+8801767163576	Jhikaracha,Jashore	e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: tenant_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_traffic (id, created_at, updated_at, tenant_id, date, request_count, last_updated, user_id) FROM stdin;
f1745e67-874e-40fc-a204-f6f42b0c855f	2026-03-06 02:45:25.596488+00	2026-03-06 02:45:25.596488+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-06	1872	2026-03-06 15:05:53.302287+00	\N
8169ceeb-f664-4d40-918f-8ff03cbfbfd0	2026-03-07 14:15:28.693446+00	2026-03-07 14:15:28.693446+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-07	2494	2026-03-07 18:25:52.536822+00	\N
29a99409-df4e-4ff4-be20-4b00362f45d9	2026-03-02 16:32:17.20637+00	2026-03-02 16:32:17.20637+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02	560	2026-03-02 17:31:21.286927+00	\N
9ec4c2a3-a0fb-4a28-8acc-0c560ec173cc	2026-03-01 11:06:28.160815+00	2026-03-01 11:06:28.160815+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	2026-03-01	397	2026-03-01 12:58:36.757311+00	\N
e449f599-ad32-4aea-9993-c6fefe93fde3	2026-03-11 14:00:03.895594+00	2026-03-11 14:00:03.895594+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-11	973	2026-03-11 16:48:08.127736+00	\N
838f9c00-726f-4706-a2fe-679700e88585	2026-02-27 06:10:13.468822+00	2026-02-27 06:10:13.468822+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	2026-02-27	52	2026-02-27 16:12:24.204174+00	\N
64b35d7f-28d3-4e02-b32d-0d5c4727db8a	2026-03-08 13:15:35.843319+00	2026-03-08 13:15:35.843319+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-08	2378	2026-03-08 18:40:55.275898+00	\N
d159a097-7cf7-4e21-8d2c-720b36dd2ff9	2026-03-04 12:42:45.63963+00	2026-03-04 12:42:45.63963+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04	1365	2026-03-04 19:05:48.144813+00	\N
7a827eee-959b-4fa4-bafe-4f6194c462e4	2026-03-05 15:38:06.797105+00	2026-03-05 15:38:06.797105+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05	754	2026-03-05 18:03:37.975402+00	\N
12e7a16a-592b-4a26-8197-43e520c1f685	2026-03-02 16:37:27.938166+00	2026-03-02 16:37:27.938166+00	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02	61	2026-03-02 17:07:17.664874+00	\N
0ffd5e93-a87f-49c0-a9b0-847966872267	2026-02-27 04:53:08.591559+00	2026-02-27 04:53:08.591559+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	2026-02-27	23	2026-02-27 06:10:12.213677+00	\N
2048e280-ff86-417c-8106-e59c8516aeb2	2026-03-13 02:09:19.677938+00	2026-03-13 02:09:19.677938+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-13	2229	2026-03-13 09:50:44.388502+00	\N
6b8b2c9d-75a7-4ddd-9a96-5167d7a9c092	2026-03-12 12:53:32.141581+00	2026-03-12 12:53:32.141581+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12	1491	2026-03-12 17:44:08.679414+00	\N
954b356f-cc7b-45d5-8974-80c81a371444	2026-03-01 12:54:28.803337+00	2026-03-01 12:54:28.803337+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01	119	2026-03-01 13:03:31.136473+00	\N
5af7f451-5c1f-461e-b4e5-4b134286bff8	2026-03-14 13:06:32.889238+00	2026-03-14 13:06:32.889238+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14	16	2026-03-14 13:06:34.789708+00	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, store_name, subdomain, custom_domain, custom_domain_status, custom_domain_verified_at, status, ssl_enabled, created_at, updated_at, subscription_plan_id, subscription_billing_cycle, subscription_status, subscription_starts_at, subscription_ends_at, user_id) FROM stdin;
e70063fd-c5b4-458b-a139-6130f2515580	gowtam	gowtam	\N	pending	\N	active	f	2026-03-01 12:54:11.602799+00	2026-03-01 12:54:11.602799+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-01 12:54:11.599+00	2026-04-01 12:54:11.599+00	\N
e46772b2-c511-4409-a267-55d282f1c0ef	poly	poly	\N	pending	\N	active	f	2026-03-02 16:37:25.868263+00	2026-03-02 16:37:25.868263+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-02 16:37:25.867+00	2026-04-02 16:37:25.867+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, username, password, phone, address, image, is_admin, is_email_verified, email_verification_token, reset_password_token, reset_password_expires, role, status, refresh_token, tenant_id, created_at, updated_at) FROM stdin;
deb0d291-6e8c-4df5-970a-216d3cd5a823	poly paul	poly@gmail.com	poly	$2b$10$RtSoRuEMg1o8cuEscMOV2uexgvI9ZPH4iS9h8C92z1OweFzSVUhtm	\N	\N	\N	f	f	e9a5ee25251afda2370f81e78061eafe81c6ed6064d00c8dab5e9b7e1ed634ed	\N	\N	Admin	Active	$2b$10$GX6DZwAd94IIEgyJTMebPekpZCyoR5un7AFohp2jIYzTlQlssmnZO	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:25.920294+00	2026-03-02 16:56:48.661062+00
e8083ac4-0762-487a-b5fb-40e38599a435	Gowtam Kumar	gowtampaul0@gmail.com	gowtam	$2b$10$b0U7tcZdvO7g68XQt0N78.ypp0lf8997iUDPEwS4O6e6BiGgGDj.i	01767163576	Jhikaracha,Jashore	http://localhost:3900/uploads/1772472477028_gowtam.jpg	f	f	90dad9e41963f91a5ffc426b0a20eb34f9debff2abb940f0f2d175620a2f3660	\N	\N	Admin	Active	$2b$10$xlUWnMrIi8p4TX5IlVZrhO45jQG74ic7Cx/okEgWyKSiADRSR/4ga	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:54:11.655429+00	2026-03-14 13:06:34.587231+00
dd5d24b0-2970-4207-a90d-5c1517890e45	gowtamkumar	admin@gmail.com	admind	$2b$10$ohbHtugVCvvb5PQQW3lFiOvl1/wVGTZDT82BVaBKXRv8sI8gZ/nVS	\N	\N	\N	t	f	efa7d8b7b65a8d3817d9c87e79b95b7338a9131ee5448d09bd0fc6713878da2b	\N	\N	SuperAdmin	Active	$2b$10$OCRG0fSg3KSQ.01hV5SmSORFWsTKSEROl4r3hs8.Y4KHdUKQyMpq2	\N	2026-02-25 15:16:18.097149+00	2026-03-08 18:41:05.166873+00
cbe41466-0d58-47a8-bd66-8dbc0ff360cc	Arkopual	Arkopual@gmail.com	Arkopual258	$2b$10$c1zS29f2wI7EqCN9jy0eEetPbhPnKaHGkdbtSVsiohxkWUpOMXtu2	\N	\N	\N	f	f	aa9cc3bf0969f231e5b4122cf2f7e6310a913435da14936ef499e4e1c5b70334	\N	\N	User	Active	$2b$10$mngNnpLT8.tl27p6s6.LEuXtlOo5Rz89BdB6R.VSXCFuRENkuND0O	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:20.636086+00	2026-03-01 13:01:20.828197+00
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 113, true);


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
-- Name: leads PK_cd102ed7a9a4ca7d4d8bfeba406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY (id);


--
-- Name: page_traffic PK_d4c976e72a5a0bcb9e29182821f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_traffic
    ADD CONSTRAINT "PK_d4c976e72a5a0bcb9e29182821f" PRIMARY KEY (id);


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
-- Name: page_traffic UQ_9102a514cadd00797b5be929a25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_traffic
    ADD CONSTRAINT "UQ_9102a514cadd00797b5be929a25" UNIQUE (tenant_id, path, date);


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
-- Name: promotions UQ_promotions_slug; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "UQ_promotions_slug" UNIQUE (slug);


--
-- Name: IDX_200e5746777e616b84e6c7ad63; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_200e5746777e616b84e6c7ad63" ON public.audit_logs USING btree (tenant_id, user_id);


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
-- Name: IDX_aa17633b6f91f0856429b1ed0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_aa17633b6f91f0856429b1ed0e" ON public.reviews USING btree (product_id, status);


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
-- Name: invoices FK_26daf5e433d6fb88ee32ce93637; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: page_traffic FK_b2457320224276606ebc0023a52; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_traffic
    ADD CONSTRAINT "FK_b2457320224276606ebc0023a52" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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

\unrestrict g5t8wjCtMmDAkoFhxsLJBR1WaLbch8ATUfEj87mJpTWO3ieaOuNNwUVNXnpDe8w

