--
-- PostgreSQL database dump
--

\restrict qYu2oFnIQe8MaTzICxRG275Fgw8WlvUdmSNRTvhulzuzUWPDX2wGiVkGorew9nz

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
    'fixed',
    'free_shipping',
    'bogo'
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
    'sslcommerz',
    'cash'
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
-- Name: products_discount_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.products_discount_type_enum AS ENUM (
    'percentage',
    'fixed',
    'free_shipping',
    'bogo'
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
-- Name: staff_invitations_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_invitations_role_enum AS ENUM (
    'Admin',
    'Operator',
    'User',
    'SuperAdmin',
    'StoreManager',
    'Support',
    'Marketing'
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
    'SuperAdmin',
    'StoreManager',
    'Support',
    'Marketing'
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
    user_id uuid,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL
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
    coupon_discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    shipping_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    delivery_zone character varying(50),
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL
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
    user_id uuid,
    og_image character varying(500)
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
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    discount_type public.products_discount_type_enum DEFAULT 'percentage'::public.products_discount_type_enum,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
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
    footer jsonb,
    products_page jsonb,
    single_product_page jsonb,
    offers_page jsonb,
    shipping_config jsonb,
    robots_txt text
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: staff_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_invitations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    role public.staff_invitations_role_enum DEFAULT 'Operator'::public.staff_invitations_role_enum NOT NULL,
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
68de9a92-d97d-455d-a5f6-64ee8e950175	2026-03-21 05:16:13.107337+00	2026-03-21 05:16:13.107337+00	d918424e-f653-4068-bb6e-caec287bc2ad	a132759e-4e63-454a-990c-58bb3aa34a2b	CREATE	Brand	\N	\N	{"name": "nike", "slug": "nike", "image": "", "website": "https://www.nike.com", "description": ""}	::ffff:172.19.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
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
c6076449-6dd1-4dfb-a04b-2a230bd03495	nike	nike			https://www.nike.com	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:16:13.100745+00	2026-03-21 05:16:13.100745+00	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, variant_id, quantity, tenant_id, created_at, updated_at, user_id) FROM stdin;
12fe41a8-152d-410c-8c28-94eadd6adf33	fdc02fa4-648a-4dae-9e9c-273989623d30	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	1	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-22 11:47:50.606196+00	2026-03-22 11:47:50.606196+00	\N
91078538-2a8d-4920-8141-67ab78fbbb24	24b67a41-6d6c-4873-a976-ab9e57f8275c	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	1	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-25 16:37:36.857175+00	2026-03-25 16:37:36.857175+00	\N
ee692523-e96c-490e-ad92-7cd98aa4479a	0496971e-75d8-4e33-978d-348ffa2bc115	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	1	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-25 16:40:41.247075+00	2026-03-25 16:40:41.247075+00	\N
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, tenant_id, created_at, updated_at, applied_coupon_code) FROM stdin;
dca3ffa6-dc2a-4b49-addd-655a9125b88d	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:21.01957+00	2026-03-01 13:01:21.01957+00	\N
7cf2db8c-8aee-4ef5-af2d-2ef955a5404a	deb0d291-6e8c-4df5-970a-216d3cd5a823	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:36.943273+00	2026-03-02 16:37:36.943273+00	\N
c9c2cb27-9e2c-492b-9546-a7de548dc7c1	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:58:56.812916+00	2026-03-06 07:49:25.754595+00	\N
cacb3514-d4d3-412b-9003-14b2e5f39044	065ad69a-eb43-45ae-aa52-a65126068816	37aee4da-502c-481c-87c7-5996d2e52a8a	2026-03-19 15:25:13.245931+00	2026-03-19 15:25:13.245931+00	\N
fdc02fa4-648a-4dae-9e9c-273989623d30	65328c8d-db41-47e4-aa21-4c657bdf4f02	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 16:12:28.98531+00	2026-03-19 16:12:28.98531+00	\N
0496971e-75d8-4e33-978d-348ffa2bc115	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:11:36.002533+00	2026-03-21 05:11:36.002533+00	\N
24b67a41-6d6c-4873-a976-ab9e57f8275c	21f16dec-bcd5-4d94-b257-7c925c1f2cca	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 04:02:33.38924+00	2026-03-22 04:02:33.38924+00	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, image, tenant_id, created_at, updated_at, user_id) FROM stdin;
4d13c2cd-a72a-4b25-94d6-2fc8d1a2b786	cate	cate			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:58:46.999455+00	2026-03-01 12:58:46.999455+00	\N
3da1ebc3-b228-41a3-926b-0f7db1df7419	Cate-2	cate-2	asdf		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:00.177629+00	2026-03-12 16:24:00.177629+00	\N
0a8d7c3f-3165-4d50-93b0-3156ad1e0bb8	Cate-3	cate-3	dd		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:07.382506+00	2026-03-12 16:24:07.382506+00	\N
77b812bb-467e-4f23-93c3-3b939468d9da	Cate-6	cate-6	asdf		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:24:15.83714+00	2026-03-12 16:24:15.83714+00	\N
ce5e902d-a48d-473f-8fd9-27227db2f644	Cate-22	cate-22			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:03.036734+00	2026-03-12 16:28:03.036734+00	\N
91029297-cd5e-4e53-9607-1460d3d42021	cate-44	cate-44			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:08.605175+00	2026-03-12 16:28:08.605175+00	\N
2f98ea96-f834-46ca-96ae-3addc27ad95b	cate-30	cate-30			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:28:15.219083+00	2026-03-12 16:28:15.219083+00	\N
096e7fad-a2d6-461b-a561-e221d78a09c9	cate-55	cate-55			e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:34:47.205529+00	2026-03-12 16:34:47.205529+00	\N
bd182e7b-168a-4b3c-ab3c-31597eb24400	cat-1	cat-1			d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:15:47.216449+00	2026-03-21 05:15:47.216449+00	\N
3a7305b9-bd66-44da-b384-74996adca5cd	Cate-1	cate-1	asdfasdfa	http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12 16:23:50.781667+00	2026-03-22 11:29:24.447838+00	\N
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
1e45d84e-613a-49e2-87be-3c136e691c9c	2026-03-19 15:44:22.565246+00	2026-03-19 15:44:22.565246+00	Offer cost		100.00	2026-03-19	OTHER		e70063fd-c5b4-458b-a139-6130f2515580	\N
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
a6c57e6d-6e71-4c9d-a6c3-8fb3f2fe264e	file	836dc89d762049da6e10a76a547fccc3.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1773504675048_836dc89d762049da6e10a76a547fccc3.webp	\N	public/uploads/1773504675048_836dc89d762049da6e10a76a547fccc3.webp	64564	2026-03-14 16:11:15.059366+00	2026-03-14 16:11:15.059366+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
44b61c56-f7c5-44f2-acba-53853ebf016e	file	ad10c6b0d18c4d008d7cb43e55df763a.jpg_2200x2200q80.jpg_.webp	7bit	image/webp	public/uploads	1773504833048_ad10c6b0d18c4d008d7cb43e55df763a.webp	\N	public/uploads/1773504833048_ad10c6b0d18c4d008d7cb43e55df763a.webp	46548	2026-03-14 16:13:53.055279+00	2026-03-14 16:13:53.055279+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
c9ad9d41-064e-4dc6-a4c3-4ce7387eeca4	file	9e04ea553b896e80bc884f5cdeffe160.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp	\N	public/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp	28916	2026-03-14 16:17:07.478128+00	2026-03-14 16:17:07.478128+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
e27dbd4c-7ca0-47f0-bb9b-b706559b32a9	file	96ee562e41468f26213d162c82cad2c4.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1773509331608_96ee562e41468f26213d162c82cad2c4.webp	\N	public/uploads/1773509331608_96ee562e41468f26213d162c82cad2c4.webp	41176	2026-03-14 17:28:51.619233+00	2026-03-14 17:28:51.619233+00	e70063fd-c5b4-458b-a139-6130f2515580	\N
954a5842-8b3d-41d3-b819-331a7cab1726	file	82696b96-2a4a-4eed-b415-e1a80c9459b6.png	7bit	image/png	public/uploads	1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png	\N	public/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png	853485	2026-03-21 05:17:53.565191+00	2026-03-21 05:17:53.565191+00	d918424e-f653-4068-bb6e-caec287bc2ad	\N
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
8a0d2c71-9250-4460-8e57-3596c5ca8d29	2026-03-14 16:12:07.948073+00	2026-03-14 16:12:07.948073+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	50	PURCHASE	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e70063fd-c5b4-458b-a139-6130f2515580	fbca5f2f-8129-422d-8996-65618cf26ceb	2f62a619-47d3-453c-a040-994509e8d923	\N
947ab4b4-61ac-458c-89bc-148d076f3d76	2026-03-14 16:12:07.957853+00	2026-03-14 16:12:07.957853+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	50	PURCHASE	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e70063fd-c5b4-458b-a139-6130f2515580	98f915b0-8a1a-423c-aee4-f6dc880d5e8a	2f62a619-47d3-453c-a040-994509e8d923	\N
a94df729-d798-4813-91ad-9524be591a78	2026-03-14 16:12:07.964197+00	2026-03-14 16:12:07.964197+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	50	PURCHASE	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e70063fd-c5b4-458b-a139-6130f2515580	642df2c1-7529-46df-9ec9-a53733089e6e	2f62a619-47d3-453c-a040-994509e8d923	\N
34012eed-42b6-49a5-9276-9edf93dfa90b	2026-03-14 16:12:07.971885+00	2026-03-14 16:12:07.971885+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	50	PURCHASE	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e70063fd-c5b4-458b-a139-6130f2515580	86118e4f-c759-45a3-ac00-240f5229c8f4	2f62a619-47d3-453c-a040-994509e8d923	\N
59b2705c-a278-4317-8d9e-e5c8ae51a915	2026-03-14 16:12:07.978213+00	2026-03-14 16:12:07.978213+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	50	PURCHASE	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e70063fd-c5b4-458b-a139-6130f2515580	4efa887e-7f62-4d3b-9edd-fc467896c39d	2f62a619-47d3-453c-a040-994509e8d923	\N
2842df48-46c7-42b2-91f3-cf5b419ee556	2026-03-14 16:14:25.056945+00	2026-03-14 16:14:25.056945+00	9cb3cf39-c99d-405a-9f8b-e24106aa4f51	IN	100	PURCHASE	aab4223a-17ac-48e5-a7b1-cb6aa856f23b	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
38aa44a2-bef2-4270-aa46-f63fafb69adc	2026-03-14 16:17:45.093282+00	2026-03-14 16:17:45.093282+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	58ba1296-5daf-420d-a87a-f4feecc364c6	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
a87b582c-c0a2-4122-a637-bf2db01d44d4	2026-03-14 16:17:45.103419+00	2026-03-14 16:17:45.103419+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	58ba1296-5daf-420d-a87a-f4feecc364c6	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
b8d972bf-00d5-4bd4-ad0f-f80b1aa1c7a5	2026-03-14 16:17:45.111173+00	2026-03-14 16:17:45.111173+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	58ba1296-5daf-420d-a87a-f4feecc364c6	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
a6095df7-10f6-480b-92d6-786e6bb7ecb3	2026-03-14 16:17:45.117051+00	2026-03-14 16:17:45.117051+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	58ba1296-5daf-420d-a87a-f4feecc364c6	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
4925b343-edcf-4184-978a-4ba569d9a0ed	2026-03-14 16:17:45.123441+00	2026-03-14 16:17:45.123441+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	58ba1296-5daf-420d-a87a-f4feecc364c6	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
4e70a3e8-778e-405c-832a-eb75d27bf123	2026-03-14 17:38:16.352339+00	2026-03-14 17:38:16.352339+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	e70063fd-c5b4-458b-a139-6130f2515580	52bb1925-7cdf-47ac-9e4d-5f9e55d393bd	2f62a619-47d3-453c-a040-994509e8d923	\N
8336f5f8-8288-4057-93f9-85098659652e	2026-03-14 17:38:16.364078+00	2026-03-14 17:38:16.364078+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	e70063fd-c5b4-458b-a139-6130f2515580	71d1564e-37df-40e5-ae3f-194dc730391b	2f62a619-47d3-453c-a040-994509e8d923	\N
e8658dc0-2171-4922-8454-e9bf2512fba9	2026-03-14 17:38:16.37165+00	2026-03-14 17:38:16.37165+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	e70063fd-c5b4-458b-a139-6130f2515580	0b9e2455-1a67-4a81-93c5-c80afaec9a66	2f62a619-47d3-453c-a040-994509e8d923	\N
b6079055-1c24-4fc2-a78d-5ee5a1bf29b0	2026-03-14 17:38:16.377863+00	2026-03-14 17:38:16.377863+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	e70063fd-c5b4-458b-a139-6130f2515580	f6d8b208-f510-4128-9764-35b817cecbdb	2f62a619-47d3-453c-a040-994509e8d923	\N
193833a0-7279-4842-a998-ad6aed5a3574	2026-03-14 17:38:16.387869+00	2026-03-14 17:38:16.387869+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	e70063fd-c5b4-458b-a139-6130f2515580	8418bc0b-4678-4e55-a291-93811ca866ab	2f62a619-47d3-453c-a040-994509e8d923	\N
8eee0bca-c049-44e7-afbb-b21ae58d282d	2026-03-14 17:29:21.50012+00	2026-03-14 17:29:21.50012+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
45d06b8f-40a2-42b0-b512-e06643b289dc	2026-03-14 17:29:21.507835+00	2026-03-14 17:29:21.507835+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
2387770a-02bb-4b1e-bd0d-2f09292aea49	2026-03-14 17:29:21.516362+00	2026-03-14 17:29:21.516362+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
5d38381b-ae5c-49db-b197-b13e63de3459	2026-03-14 17:29:21.523882+00	2026-03-14 17:29:21.523882+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
724d0e13-3593-49c5-82ca-b7064c79390f	2026-03-14 17:29:21.532379+00	2026-03-14 17:29:21.532379+00	3cf88127-1d9a-4c27-967c-e5819cb70edd	IN	118	PURCHASE	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	e70063fd-c5b4-458b-a139-6130f2515580	\N	2f62a619-47d3-453c-a040-994509e8d923	\N
c9db746c-b51d-4901-b81b-18635acfbf6c	2026-03-16 12:25:17.350987+00	2026-03-16 12:25:17.350987+00	9cb3cf39-c99d-405a-9f8b-e24106aa4f51	IN	100	ADJUSTMENT	nw	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
e4ce7a43-8b8b-431f-a7ee-bd64646ae44d	2026-03-16 12:26:55.699397+00	2026-03-16 12:26:55.699397+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	10	ADJUSTMENT		e70063fd-c5b4-458b-a139-6130f2515580	4efa887e-7f62-4d3b-9edd-fc467896c39d	\N	\N
1f629f7d-ed41-4260-a178-0b17c54692d2	2026-03-16 12:27:07.101863+00	2026-03-16 12:27:07.101863+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	5	ADJUSTMENT		e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
4d1005ef-5945-435f-9e81-fef17dcce797	2026-03-16 12:28:10.416178+00	2026-03-16 12:28:10.416178+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	5	ADJUSTMENT		e70063fd-c5b4-458b-a139-6130f2515580	fbca5f2f-8129-422d-8996-65618cf26ceb	\N	\N
3b6671e4-6f3a-4f9f-925a-57c2b502bf1f	2026-03-16 12:28:27.417333+00	2026-03-16 12:28:27.417333+00	e8ca9057-1328-4b9b-bf05-f25de381fd47	IN	5	ADJUSTMENT		e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
b45ba8de-1288-439f-b46a-9f8c95700472	2026-03-19 15:26:43.65739+00	2026-03-19 15:26:43.65739+00	6049be83-338f-4f1d-a0fb-e748b77eea6c	OUT	1	ORDER	\N	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
249a263f-6170-463a-bc28-784facbad630	2026-03-19 16:16:41.239492+00	2026-03-19 16:16:41.239492+00	9cb3cf39-c99d-405a-9f8b-e24106aa4f51	OUT	1	ORDER	\N	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	\N
18fd4340-8a6b-464a-a80c-b43c9877fa57	2026-03-21 05:32:40.91087+00	2026-03-21 05:32:40.91087+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	900	PURCHASE	1052e821-58b2-4fc6-a2c1-864b251ffbc9	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
8eede6c8-760f-4ea0-92fc-d0b23f994f6b	2026-03-21 05:32:40.91897+00	2026-03-21 05:32:40.91897+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	500	PURCHASE	1052e821-58b2-4fc6-a2c1-864b251ffbc9	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
82808024-6228-43c1-b3f7-67b65a235726	2026-03-21 05:32:40.928959+00	2026-03-21 05:32:40.928959+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	400	PURCHASE	1052e821-58b2-4fc6-a2c1-864b251ffbc9	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
11f095f5-e1d2-4272-88ae-52398abee692	2026-03-21 06:04:43.117467+00	2026-03-21 06:04:43.117467+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	400	PURCHASE	f9c4561a-682c-4f7b-8e0f-e6013b148f17	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
5bbd9148-39ff-4f75-836b-2d3208fd6214	2026-03-21 06:04:43.1255+00	2026-03-21 06:04:43.1255+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	500	PURCHASE	f9c4561a-682c-4f7b-8e0f-e6013b148f17	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
9f812a0b-ad47-45d9-8c31-fbb3d012c2b7	2026-03-21 06:04:43.133389+00	2026-03-21 06:04:43.133389+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	900	PURCHASE	f9c4561a-682c-4f7b-8e0f-e6013b148f17	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
0973445b-9312-45c1-8284-3a623f190d7b	2026-03-21 06:13:51.839835+00	2026-03-21 06:13:51.839835+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
7dd0e12e-6515-41b1-acde-87efb75f2856	2026-03-21 06:13:51.848389+00	2026-03-21 06:13:51.848389+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	d918424e-f653-4068-bb6e-caec287bc2ad	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
dc98982a-d6ef-47c1-a726-e3fa91e86900	2026-03-21 06:13:51.855817+00	2026-03-21 06:13:51.855817+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	d918424e-f653-4068-bb6e-caec287bc2ad	5b7c9b65-e633-4023-a3fc-94fd80199889	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
efc42b48-060d-48a5-9d0b-cbb04f4cb735	2026-03-21 06:05:45.073189+00	2026-03-21 06:05:45.073189+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	09ba357d-1130-418c-b1fc-63daff85724c	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
8ce30066-2a27-4d03-b762-8e2e6c76ca84	2026-03-21 06:05:45.084649+00	2026-03-21 06:05:45.084649+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	09ba357d-1130-418c-b1fc-63daff85724c	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
ea003427-ccbc-4cc0-bf13-90015f0d74f0	2026-03-21 06:05:45.090855+00	2026-03-21 06:05:45.090855+00	113d2fc0-651e-4440-acc8-a126fbbd6501	IN	5	PURCHASE	09ba357d-1130-418c-b1fc-63daff85724c	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
e7df0bf7-0180-4574-aacb-1fff64e97b38	2026-03-21 06:53:43.698482+00	2026-03-21 06:53:43.698482+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N	\N
3a6f06d3-69bd-488f-a906-f8de8c77f2f8	2026-03-21 07:00:41.414363+00	2026-03-21 07:00:41.414363+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
3e25e174-9b8c-4439-aec3-9985c040bd41	2026-03-21 08:21:48.125798+00	2026-03-21 08:21:48.125798+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	IN	1	PURCHASE	d3560277-b889-45c1-aa3e-465e54cf8a08	d918424e-f653-4068-bb6e-caec287bc2ad	\N	d0215f61-39f2-4030-8216-6a300eefb8ac	\N
2d524045-1272-4c92-8d34-4a0a4a8b9d8d	2026-03-21 10:47:04.651861+00	2026-03-21 10:47:04.651861+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	\N	\N
3d8e3eaa-c544-4a26-be14-593bd837c054	2026-03-21 10:47:04.651861+00	2026-03-21 10:47:04.651861+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
c9de52fb-bb4c-42d0-8430-1dfd884fa7c3	2026-03-21 10:48:19.04846+00	2026-03-21 10:48:19.04846+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5b7c9b65-e633-4023-a3fc-94fd80199889	\N	\N
6ad6e99d-dd55-4462-a978-caebcbff784a	2026-03-21 10:48:19.04846+00	2026-03-21 10:48:19.04846+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N	\N
833dc910-54a9-41c9-89f3-5d201d44c53a	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N	\N
374c85f8-6383-42f5-b7c7-ad7634fa97d5	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5b7c9b65-e633-4023-a3fc-94fd80199889	\N	\N
34edb0b2-192f-4750-bdc0-77da906fc920	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
f384c251-0d31-419a-8859-1f959ea251f9	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	\N	\N
cb29b4ec-b729-4b90-88d9-5b2f95001aac	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5b7c9b65-e633-4023-a3fc-94fd80199889	\N	\N
2a888703-f291-40f0-929b-b2965000ac9e	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
2fc55579-da9a-409e-9fef-333241d35669	2026-03-21 11:05:27.088703+00	2026-03-21 11:05:27.088703+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N	\N
55be58df-88e0-4531-a640-fcbab4736f03	2026-03-22 02:45:17.374357+00	2026-03-22 02:45:17.374357+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
9ed212ca-d777-4ef8-8481-f710cdbb47d2	2026-03-22 03:23:44.245453+00	2026-03-22 03:23:44.245453+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	\N	\N
59c3fcc5-a99a-45c4-bba8-87f1f09258ae	2026-03-22 03:28:26.115377+00	2026-03-22 03:28:26.115377+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
72ad54ff-6907-4504-a267-b223fa9d8dca	2026-03-22 03:32:38.340616+00	2026-03-22 03:32:38.340616+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
e006ff50-7d1f-4968-a0c8-b243355d36fc	2026-03-22 03:34:02.428781+00	2026-03-22 03:34:02.428781+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
f1145f8c-c906-4665-bf3a-060222cbfe40	2026-03-22 03:34:49.567439+00	2026-03-22 03:34:49.567439+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5b7c9b65-e633-4023-a3fc-94fd80199889	\N	\N
d656d34a-13b8-4434-823f-e833d6f5d7d7	2026-03-22 03:42:56.251979+00	2026-03-22 03:42:56.251979+00	113d2fc0-651e-4440-acc8-a126fbbd6501	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N	\N
e2f900df-08b5-4d7d-833e-6180b7b8df9f	2026-03-22 04:02:33.602749+00	2026-03-22 04:02:33.602749+00	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	OUT	1	ORDER	\N	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	\N
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
9307a7aa-4f0b-49b1-8961-361bac7ac94b	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 14:55:19.354969+00	2026-03-16 14:55:19.354969+00	\N
0caf9bab-92f5-4755-b13c-2f746ba7722e	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 14:55:22.138363+00	2026-03-16 14:55:22.138363+00	\N
140feb10-e0cc-4f48-a286-070bca80e3c9	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 14:55:24.557375+00	2026-03-16 14:55:24.557375+00	\N
d6449561-e454-442a-a892-f8b93e21d615	Newsletter Subscriber	gowtampaul0@gmail.com	\N	\N	Newsletter Signup	User signed up for newsletter from footer/page section.	new	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 14:55:26.761375+00	2026-03-16 14:55:26.761375+00	\N
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

COPY public.order_items (id, order_id, product_id, variant_id, snapshot, quantity, unit_price, discount_amount, total_amount, tenant_id, created_at, updated_at, user_id, tax_amount) FROM stdin;
2a4473cb-9b8f-4fa6-81a9-b7a7b9357a46	cf65241e-b924-478c-ae13-a93f2bb1e6e9	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	1	1000.00	100.00	900.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:21.267963+00	2026-03-01 13:01:21.267963+00	\N	0.00
fbcf20c0-87d2-49d4-8354-b73337540460	1b9965b4-5557-4f0e-b3f4-cd9d16df1182	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	2	1000.00	100.00	1800.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:02:57.694061+00	2026-03-01 13:02:57.694061+00	\N	0.00
a973c50d-0420-4e4c-a954-c2e07ff7fbce	5eb15aa1-2327-4c12-8309-3638c4837120	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	2	659.00	10.00	1298.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04 17:50:29.035953+00	2026-03-04 17:50:38.958679+00	\N	0.00
6e320a91-7c3f-42cd-a65b-841cfd74ca65	06d2e519-617a-40c1-bc35-9504e7ffc42e	25e3ab42-6ac3-4a38-b773-aca27a2a5514	5179bc44-ae7e-4c4e-8745-62e018ad83e8	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "5179bc44-ae7e-4c4e-8745-62e018ad83e8", "variantSku": "SKU-3R8FD3EL5", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "md"}}	10	1000.00	100.00	9000.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04 18:52:42.18936+00	2026-03-04 18:52:42.18936+00	\N	0.00
728c3c6f-b9a4-49fc-b9a1-26b4b9ae66e7	7d40c6f1-899d-4879-b1bc-b938478d8409	25e3ab42-6ac3-4a38-b773-aca27a2a5514	80b5fca1-5ed4-4f21-8eae-1d815126418f	{"price": 1000, "productId": "25e3ab42-6ac3-4a38-b773-aca27a2a5514", "variantId": "80b5fca1-5ed4-4f21-8eae-1d815126418f", "variantSku": "SKU-0AYXCVZ86", "productName": "new product test", "productImage": "http://localhost:3900/uploads/1772363368735_gowtam.jpg", "variantOptions": {"Size": "sm"}}	10	1000.00	100.00	9000.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 15:46:20.723763+00	2026-03-05 15:46:20.723763+00	\N	0.00
faae0122-6b63-4976-946e-cc8f9e02c83f	1a0e6291-299a-428b-a73e-0b70e2d81fc9	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	1	659.00	100.00	559.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 15:26:43.65739+00	2026-03-19 15:31:08.907214+00	\N	0.00
d8a841a2-b851-49a5-9bae-28546b02e55d	ab7c5141-4a99-4abc-8e6c-a9184c0eb844	9cb3cf39-c99d-405a-9f8b-e24106aa4f51	\N	{"price": 500, "productId": "9cb3cf39-c99d-405a-9f8b-e24106aa4f51", "productName": "V8 Rgb Transparent Mecha Bluetooth Speaker", "productImage": "http://localhost:3900/uploads/1773504833048_ad10c6b0d18c4d008d7cb43e55df763a.webp"}	1	500.00	60.00	440.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 16:16:41.239492+00	2026-03-19 16:16:41.239492+00	\N	0.00
4b786c20-4dd2-4083-9857-7a44f4c74620	a47ba302-b6ae-46b2-894d-54179ac76c4e	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	1	659.00	10.00	649.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05 17:57:39.771637+00	2026-03-05 17:59:22.892181+00	\N	0.00
f233effa-5608-4eac-8a11-508bbefe5442	e97c5fd4-a4ad-4b57-8729-209cdedc2509	113d2fc0-651e-4440-acc8-a126fbbd6501	5c944d61-4c72-4ac2-9c2b-0380444d8c64	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5c944d61-4c72-4ac2-9c2b-0380444d8c64", "variantSku": "SKU-FWECVWZVQ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "lg"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 06:53:43.698482+00	2026-03-21 06:53:43.698482+00	\N	0.00
c3d1a10e-5476-4120-8b74-5222a3c012f0	cda460d8-7598-42df-b4bf-780bd14c8a08	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	2	659.00	10.00	1298.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-06 12:55:10.448877+00	2026-03-06 12:56:53.251624+00	\N	0.00
ee2a1df6-7c66-481f-a249-023078e6f201	2cee0857-9cce-4ef3-853e-2d0584c01a32	3cf88127-1d9a-4c27-967c-e5819cb70edd	52bb1925-7cdf-47ac-9e4d-5f9e55d393bd	{"price": 4000, "productId": "3cf88127-1d9a-4c27-967c-e5819cb70edd", "variantId": "52bb1925-7cdf-47ac-9e4d-5f9e55d393bd", "variantSku": "SKU-96IM5HUYM", "productName": "Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable", "productImage": "http://localhost:3900/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp", "variantOptions": {"Size": "lg"}}	1	4000.00	500.00	3500.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 11:33:41.698329+00	2026-03-16 11:33:41.698329+00	\N	0.00
062504b6-5747-4d37-8bdb-65378f1856ab	8ba9259b-7165-4e59-b217-491a16b9f37c	3cf88127-1d9a-4c27-967c-e5819cb70edd	52bb1925-7cdf-47ac-9e4d-5f9e55d393bd	{"price": 4000, "productId": "3cf88127-1d9a-4c27-967c-e5819cb70edd", "variantId": "52bb1925-7cdf-47ac-9e4d-5f9e55d393bd", "variantSku": "SKU-96IM5HUYM", "productName": "Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable", "productImage": "http://localhost:3900/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp", "variantOptions": {"Size": "lg"}}	1	4000.00	500.00	3500.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 11:45:36.38907+00	2026-03-16 11:45:36.38907+00	\N	0.00
911b65d6-0cc2-4199-a39e-afac242738e5	833efbb1-8911-4401-8322-fa96eb4d1af9	6049be83-338f-4f1d-a0fb-e748b77eea6c	\N	{"price": 659, "productId": "6049be83-338f-4f1d-a0fb-e748b77eea6c", "productName": "Starship Full Cream Milk Powder - 1kg", "productImage": "http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp"}	1	659.00	100.00	559.00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16 11:51:35.005626+00	2026-03-16 11:51:35.005626+00	\N	0.00
f9373bdc-cde1-47ed-9312-01035cf80228	9a2b5794-0b1d-45da-9b6a-492929358f74	113d2fc0-651e-4440-acc8-a126fbbd6501	5b7c9b65-e633-4023-a3fc-94fd80199889	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5b7c9b65-e633-4023-a3fc-94fd80199889", "variantSku": "SKU-B5XCQGCVD", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "md"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:19.04846+00	2026-03-21 10:48:19.04846+00	\N	6.75
6a69ed62-373a-41c0-9ad6-07c4d81ac08d	e19abe50-a04c-4b5e-a3ea-17353d7a73c9	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 07:00:41.414363+00	2026-03-21 07:06:21.589174+00	\N	0.00
e9b29491-a768-4943-bc3e-a119808d0e74	16a08afb-bcab-4d49-9652-cde2310491c4	113d2fc0-651e-4440-acc8-a126fbbd6501	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "df5e0101-70f0-4ae3-90f8-ae70cd73f9bd", "variantSku": "SKU-N8S39SXLJ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "sm"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:47:04.651861+00	2026-03-21 10:47:04.651861+00	\N	6.75
d076fc5c-1f53-42d2-87a6-aeef969cf29a	9a2b5794-0b1d-45da-9b6a-492929358f74	113d2fc0-651e-4440-acc8-a126fbbd6501	5c944d61-4c72-4ac2-9c2b-0380444d8c64	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5c944d61-4c72-4ac2-9c2b-0380444d8c64", "variantSku": "SKU-FWECVWZVQ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "lg"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:19.04846+00	2026-03-21 10:48:19.04846+00	\N	6.75
35478d71-f387-4006-a26e-83f7f40b70bd	16a08afb-bcab-4d49-9652-cde2310491c4	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:47:04.651861+00	2026-03-21 10:47:04.651861+00	\N	0.00
5abfeb03-90f5-410b-b27e-c93522cc6c18	b63a40a7-20fe-4a55-ab6d-6728acfbc142	113d2fc0-651e-4440-acc8-a126fbbd6501	5c944d61-4c72-4ac2-9c2b-0380444d8c64	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5c944d61-4c72-4ac2-9c2b-0380444d8c64", "variantSku": "SKU-FWECVWZVQ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "lg"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	\N	6.75
c2bc46ba-88f2-4fbe-b114-5696fbe8adb6	b63a40a7-20fe-4a55-ab6d-6728acfbc142	113d2fc0-651e-4440-acc8-a126fbbd6501	5b7c9b65-e633-4023-a3fc-94fd80199889	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5b7c9b65-e633-4023-a3fc-94fd80199889", "variantSku": "SKU-B5XCQGCVD", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "md"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	\N	6.75
e28d1ae7-56cf-40f0-b45d-c05dc6a432f8	b63a40a7-20fe-4a55-ab6d-6728acfbc142	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.192864+00	\N	0.00
f481e08f-a8dc-48b6-9f89-c40fb6c7495c	02b694b1-c8c2-4824-9d1c-849a0e84ccbc	113d2fc0-651e-4440-acc8-a126fbbd6501	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "df5e0101-70f0-4ae3-90f8-ae70cd73f9bd", "variantSku": "SKU-N8S39SXLJ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "sm"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	\N	6.75
82c3e11a-8f4e-457d-95c5-1417e577f6aa	02b694b1-c8c2-4824-9d1c-849a0e84ccbc	113d2fc0-651e-4440-acc8-a126fbbd6501	5b7c9b65-e633-4023-a3fc-94fd80199889	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5b7c9b65-e633-4023-a3fc-94fd80199889", "variantSku": "SKU-B5XCQGCVD", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "md"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	\N	6.75
33d63921-9ec3-47d7-889d-f99f402e3238	02b694b1-c8c2-4824-9d1c-849a0e84ccbc	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.125274+00	\N	0.00
eae62605-6ed2-446c-bb65-c215c6c37465	fe73a98f-8de9-423e-8a9d-d888a006286c	113d2fc0-651e-4440-acc8-a126fbbd6501	5c944d61-4c72-4ac2-9c2b-0380444d8c64	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5c944d61-4c72-4ac2-9c2b-0380444d8c64", "variantSku": "SKU-FWECVWZVQ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "lg"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 11:05:27.088703+00	2026-03-21 11:05:27.088703+00	\N	6.75
1f4b8b68-3721-4b13-ad6a-559752de40be	2048d9fb-ef5e-4abf-bc01-53d6459d13cf	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 02:45:17.374357+00	2026-03-22 02:45:17.374357+00	\N	0.00
a7eb05c8-cd54-4c0f-88cd-83c026321671	f38cece6-c8ac-499e-8b5b-b14257a92191	113d2fc0-651e-4440-acc8-a126fbbd6501	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "df5e0101-70f0-4ae3-90f8-ae70cd73f9bd", "variantSku": "SKU-N8S39SXLJ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "sm"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:23:44.245453+00	2026-03-22 03:23:44.245453+00	\N	6.75
01dc6574-c587-46d4-8777-7459ca78f811	6bd8a8ff-c66a-4f06-84b0-6fb476a49ba4	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:28:26.115377+00	2026-03-22 03:28:26.115377+00	\N	0.00
f2d4b975-6875-4b9d-ba57-e6c096c71400	5efda44a-15f0-4a43-b834-3025f252c02c	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:32:38.340616+00	2026-03-22 03:32:38.340616+00	\N	0.00
a37c3f61-0480-4797-b17f-37e330941907	1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:34:02.428781+00	2026-03-22 03:34:02.428781+00	\N	0.00
94d215f3-4324-4bd2-85b8-42acd50109e3	8a6d45b6-9b73-48b8-bae3-3e9e14b19ec0	113d2fc0-651e-4440-acc8-a126fbbd6501	5b7c9b65-e633-4023-a3fc-94fd80199889	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5b7c9b65-e633-4023-a3fc-94fd80199889", "variantSku": "SKU-B5XCQGCVD", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "md"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:34:49.567439+00	2026-03-22 03:34:49.567439+00	\N	6.75
17337867-40b3-4c86-8736-a99006ef5bf0	9209d41c-1463-4857-9985-a8453f0c88bb	113d2fc0-651e-4440-acc8-a126fbbd6501	5c944d61-4c72-4ac2-9c2b-0380444d8c64	{"price": 50, "productId": "113d2fc0-651e-4440-acc8-a126fbbd6501", "variantId": "5c944d61-4c72-4ac2-9c2b-0380444d8c64", "variantSku": "SKU-FWECVWZVQ", "productName": "test-1", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png", "variantOptions": {"size": "lg"}}	1	50.00	5.00	51.75	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:42:56.251979+00	2026-03-22 03:42:56.251979+00	\N	6.75
932af903-4e1c-42a8-86e8-ea1e08b911a4	66577e34-9d62-4ed5-9902-4fbc5b1f1ca8	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	\N	{"price": 100, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e", "productName": "new test product", "productImage": "http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png"}	1	100.00	10.00	90.00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 04:02:33.602749+00	2026-03-22 04:02:33.602749+00	\N	0.00
\.


--
-- Data for Name: order_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_returns (id, order_id, user_id, status, reason, admin_comment, refund_amount, items, tenant_id, created_at, updated_at) FROM stdin;
590e8002-26f2-4d55-ac89-68341155298e	e19abe50-a04c-4b5e-a3ea-17353d7a73c9	a132759e-4e63-454a-990c-58bb3aa34a2b	refunded	Other	\N	\N	[{"quantity": 1, "productId": "fcfb7fbe-1a64-4963-b6e7-b55089b4132e"}]	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 07:06:51.11802+00	2026-03-22 03:44:29.319042+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_name, customer_email, customer_phone, address, total_amount, currency, currency_rate, status, payment_method, payment_status, transaction_id, order_notes, user_id, tenant_id, tracking_id, courier_status, created_at, updated_at, applied_coupon, coupon_discount_amount, shipping_fee, delivery_zone, tax_amount) FROM stdin;
b63a40a7-20fe-4a55-ab6d-6728acfbc142	nice	nice@gmail.com	01700000000	In Store	193.50	BDT	1.0000	completed	cod	paid	POS_1774090139222	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 10:48:59.192864+00	2026-03-21 10:48:59.221638+00	\N	0.00	0.00	\N	13.50
cf65241e-b924-478c-ae13-a93f2bb1e6e9	Arkopual	Arkopual@gmail.com	01767163576	Jhikaracha,Jashore	900.00	USD	1.0000	completed	cod	paid	\N	asdfasdf	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-01 13:01:21.267963+00	2026-03-02 17:11:33.172902+00	\N	0.00	0.00	\N	0.00
1b9965b4-5557-4f0e-b3f4-cd9d16df1182	Arkopuals	Arkopuals@gmail.com	01767163576	Jhikaracha,Jashore	1800.00	USD	1.0000	completed	cod	paid	\N	ddddd	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-01 13:02:57.694061+00	2026-03-02 17:11:41.499932+00	\N	0.00	0.00	\N	0.00
5eb15aa1-2327-4c12-8309-3638c4837120	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	1298.00	BDT	1.0000	completed	cod	pending	\N	sdsdafasdf	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-04 17:50:29.035953+00	2026-03-04 17:50:38.958679+00	\N	0.00	0.00	\N	0.00
06d2e519-617a-40c1-bc35-9504e7ffc42e	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	9000.00	BDT	1.0000	completed	cod	pending	\N	sss	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-04 18:52:42.18936+00	2026-03-04 18:53:26.913545+00	\N	0.00	0.00	\N	0.00
02b694b1-c8c2-4824-9d1c-849a0e84ccbc	nice	nice@gmail.com	01700000000	In Store	193.50	BDT	1.0000	completed	cod	paid	POS_1774090220152	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 10:50:20.125274+00	2026-03-21 10:50:20.152109+00	\N	0.00	0.00	\N	13.50
7d40c6f1-899d-4879-b1bc-b938478d8409	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	9000.00	BDT	1.0000	completed	cod	paid	\N	dddd	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-05 15:46:20.723763+00	2026-03-05 15:46:51.196251+00	\N	0.00	0.00	\N	0.00
a47ba302-b6ae-46b2-894d-54179ac76c4e	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	549.00	BDT	1.0000	completed	cod	paid	\N		e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-05 17:57:39.771637+00	2026-03-05 17:59:21.24004+00	W6WM53TR	100.00	0.00	\N	0.00
fe73a98f-8de9-423e-8a9d-d888a006286c	nice	nice@gmail.com	01700000000	In Store	51.75	BDT	1.0000	completed	cod	paid	POS_1774091127116	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 11:05:27.088703+00	2026-03-21 11:05:27.114997+00	\N	0.00	0.00	\N	6.75
cda460d8-7598-42df-b4bf-780bd14c8a08	Arkopual	Arkopual@gmail.com	01767163576	Jashore	1298.00	BDT	1.0000	completed	cod	paid	\N	asdfasdf	cbe41466-0d58-47a8-bd66-8dbc0ff360cc	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-06 12:55:10.448877+00	2026-03-06 12:56:53.251624+00	\N	0.00	0.00	\N	0.00
2cee0857-9cce-4ef3-853e-2d0584c01a32	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	3500.00	BDT	1.0000	pending	sslcommerz	pending	\N		e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-16 11:33:41.698329+00	2026-03-16 11:33:41.698329+00	\N	0.00	0.00	\N	0.00
8ba9259b-7165-4e59-b217-491a16b9f37c	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	3500.00	BDT	1.0000	pending	cod	pending	\N		e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-16 11:45:36.38907+00	2026-03-16 11:45:36.38907+00	\N	0.00	0.00	\N	0.00
833efbb1-8911-4401-8322-fa96eb4d1af9	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	559.00	BDT	1.0000	pending	cod	pending	\N		e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-16 11:51:35.005626+00	2026-03-16 11:51:35.005626+00	\N	0.00	0.00	\N	0.00
1a0e6291-299a-428b-a73e-0b70e2d81fc9	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	559.00	BDT	1.0000	completed	cod	paid	\N	ssss	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-19 15:26:43.65739+00	2026-03-19 15:31:08.907214+00	\N	0.00	0.00	\N	0.00
ab7c5141-4a99-4abc-8e6c-a9184c0eb844	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Jhikaracha,Jashore	440.00	BDT	1.0000	pending	cod	pending	\N	ASDASd	e8083ac4-0762-487a-b5fb-40e38599a435	e70063fd-c5b4-458b-a139-6130f2515580	\N	\N	2026-03-19 16:16:41.239492+00	2026-03-19 16:16:41.239492+00	\N	0.00	0.00	\N	0.00
e97c5fd4-a4ad-4b57-8729-209cdedc2509	nice	nice@gmail.com	01767163576	Jhikaracha,Jashore	105.00	USD	1.0000	pending	cod	pending	\N	asdasdfasdf	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 06:53:43.698482+00	2026-03-21 06:53:43.698482+00	\N	0.00	60.00	\N	0.00
e19abe50-a04c-4b5e-a3ea-17353d7a73c9	nice	nice@gmail.com	01767163576	Jhikaracha,Jashore	150.00	USD	1.0000	completed	cod	paid	\N	dsfasdfasdf	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 07:00:41.414363+00	2026-03-21 07:06:21.589174+00	\N	0.00	60.00	\N	0.00
16a08afb-bcab-4d49-9652-cde2310491c4	nice	nice@gmail.com	01700000000	In Store	141.75	BDT	1.0000	completed	cod	paid	POS_1774090024712	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 10:47:04.651861+00	2026-03-21 10:47:04.711925+00	\N	0.00	0.00	\N	6.75
9a2b5794-0b1d-45da-9b6a-492929358f74	nice	nice@gmail.com	01700000000	In Store	103.50	BDT	1.0000	completed	cod	paid	POS_1774090099074	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-21 10:48:19.04846+00	2026-03-21 10:48:19.073389+00	\N	0.00	0.00	\N	13.50
2048d9fb-ef5e-4abf-bc01-53d6459d13cf	nice	nice@gmail.com	01700000000	In Store / Walk-in	90.00	BDT	1.0000	completed	cod	paid	POS_1774147517396	dfasdfasdf	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 02:45:17.374357+00	2026-03-22 02:45:17.395235+00	\N	0.00	0.00	\N	0.00
f38cece6-c8ac-499e-8b5b-b14257a92191	nice	nice@gmail.com	01700000000	In Store / Walk-in	111.75	USD	1.0000	completed	cash	paid	POS_1774149824271	dfgadsfgsdfg	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:23:44.245453+00	2026-03-22 03:23:44.268836+00	\N	0.00	60.00	inside	6.75
6bd8a8ff-c66a-4f06-84b0-6fb476a49ba4	nice	nice@gmail.com	01767163576	Jhikaracha,Jashore	150.00	USD	1.0000	pending	sslcommerz	pending	TRAN_6bd8a8ff-c66a-4f06-84b0-6fb476a49ba4_1774150106201	asdfasdf	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:28:26.115377+00	2026-03-22 03:28:26.205404+00	\N	0.00	60.00	inside	0.00
8a6d45b6-9b73-48b8-bae3-3e9e14b19ec0	nice	nice@gmail.com	01700000000	In Store / Walk-in	51.75	USD	1.0000	completed	sslcommerz	pending	TRAN_8a6d45b6-9b73-48b8-bae3-3e9e14b19ec0_1774150489617	sdfg	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:34:49.567439+00	2026-03-22 03:34:49.619896+00	\N	0.00	0.00	\N	6.75
5efda44a-15f0-4a43-b834-3025f252c02c	nice	nice@gmail.com	01700000000	In Store / Walk-in	150.00	USD	1.0000	completed	sslcommerz	pending	TRAN_5efda44a-15f0-4a43-b834-3025f252c02c_1774150358372	\N	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:32:38.340616+00	2026-03-22 03:32:38.374976+00	\N	0.00	60.00	inside	0.00
1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9	nice	nice@gmail.com	01767163576	Monoharpur,kayemkola bazar, Jhikargacha,	150.00	USD	1.0000	pending	sslcommerz	paid	TRAN_1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9_1774150442501	sadfasdf	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:34:02.428781+00	2026-03-22 03:34:10.904145+00	\N	0.00	60.00	inside	0.00
9209d41c-1463-4857-9985-a8453f0c88bb	nice	nice@gmail.com	01700000000	In Store / Walk-in	51.75	USD	1.0000	pending	sslcommerz	paid	TRAN_9209d41c-1463-4857-9985-a8453f0c88bb_1774150976302	dfg	a132759e-4e63-454a-990c-58bb3aa34a2b	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 03:42:56.251979+00	2026-03-22 03:43:04.973821+00	\N	0.00	0.00	\N	6.75
66577e34-9d62-4ed5-9902-4fbc5b1f1ca8	Gowtam Kumar	gowtampaul0@gmail.com	01767163576	Monoharpur,kayemkola bazar, Jhikargacha,	150.00	USD	1.0000	pending	cod	pending	\N	asdfasdf	21f16dec-bcd5-4d94-b257-7c925c1f2cca	d918424e-f653-4068-bb6e-caec287bc2ad	\N	\N	2026-03-22 04:02:33.602749+00	2026-03-22 04:02:33.602749+00	\N	0.00	60.00	inside	0.00
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
276f3417-a533-41d5-91e1-ee7fbb32297e	2026-03-13 09:40:02.5735+00	2026-03-13 09:40:02.5735+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-13	1	2026-03-13 09:40:02.5735+00	\N
6279a235-abf2-4105-a04f-296be6391483	2026-03-13 02:09:21.300138+00	2026-03-13 02:09:21.300138+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-13	73	2026-03-13 09:40:04.181564+00	\N
aad9d935-41da-4e9b-80da-272334fca7d2	2026-03-14 13:06:32.970439+00	2026-03-14 13:06:32.970439+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-14	47	2026-03-14 17:55:29.406958+00	\N
e488b6ba-170b-447e-8ef1-6d83de2d41b0	2026-03-13 09:30:25.21701+00	2026-03-13 09:30:25.21701+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/public	2026-03-13	1191	2026-03-13 09:32:49.065568+00	\N
7b6ba6af-773c-4ac2-b77a-4ce1b0f75b69	2026-03-12 17:02:28.329148+00	2026-03-12 17:02:28.329148+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-12	2	2026-03-12 17:02:28.411178+00	\N
dccc82d0-724d-4116-bc6a-d34e2aa09748	2026-03-12 17:02:28.420549+00	2026-03-12 17:02:28.420549+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-12	2	2026-03-12 17:02:28.463765+00	\N
c994196e-7088-4800-a67f-a92f7f8d708e	2026-03-13 02:09:22.538509+00	2026-03-13 02:09:22.538509+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-13	4	2026-03-13 02:11:02.894953+00	\N
02bc87a5-9d45-40ab-a64f-9ddf41f9b2ca	2026-03-13 02:11:06.2702+00	2026-03-13 02:11:06.2702+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-13	2	2026-03-13 02:11:06.280452+00	\N
6ad8ce4d-ae13-44b5-ab5e-a88decf1fa0f	2026-03-12 14:37:29.470216+00	2026-03-12 14:37:29.470216+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-12	1	2026-03-12 14:37:29.470216+00	\N
8b329b30-b54d-444a-977d-2aa1a8ce40ac	2026-03-14 13:31:30.631414+00	2026-03-14 13:31:30.631414+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-14	13	2026-03-14 17:55:30.09539+00	\N
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
672db28d-de99-4f0e-9185-412275a3e39d	2026-03-14 16:26:20.271319+00	2026-03-14 16:26:20.271319+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/premium-step-cotton-panjabi-for-mens-super-duper-hit-collection	2026-03-14	3	2026-03-14 18:18:12.754216+00	\N
1c0543a6-7389-4e9c-a474-844ee3c61637	2026-03-12 14:02:16.739315+00	2026-03-12 14:02:16.739315+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/86056f63-c0ea-41f7-87fc-3a63f3b055f9	2026-03-12	1	2026-03-12 14:02:16.739315+00	\N
b1074e07-158a-40c6-ac44-dd6c17535ddf	2026-03-12 12:54:34.279728+00	2026-03-12 12:54:34.279728+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-12	142	2026-03-12 17:35:46.492523+00	\N
bc2be399-89b3-4fe4-a215-73c55b24d85b	2026-03-12 12:54:34.309471+00	2026-03-12 12:54:34.309471+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-12	154	2026-03-12 17:43:19.643757+00	\N
ac84e7e2-b349-460d-b258-f88a7c662c6d	2026-03-14 13:28:49.671492+00	2026-03-14 13:28:49.671492+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-14	6	2026-03-14 18:04:04.069145+00	\N
179bdcd2-874f-4a12-9fbf-8779be2facfc	2026-03-12 12:53:33.06922+00	2026-03-12 12:53:33.06922+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-12	158	2026-03-12 17:43:19.704172+00	\N
95f151ae-e57f-4343-b666-0ff4d5bf7f12	2026-03-12 12:53:33.286913+00	2026-03-12 12:53:33.286913+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-12	95	2026-03-12 17:43:19.859493+00	\N
61df7aff-5932-416c-a848-d8ef24c6dd0e	2026-03-12 14:02:02.80442+00	2026-03-12 14:02:02.80442+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-12	3	2026-03-12 14:08:04.21781+00	\N
71a0a86a-5f03-4179-b13d-848c5685ba39	2026-03-14 16:26:20.94232+00	2026-03-14 16:26:20.94232+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/premium-step-cotton-panjabi-for-mens-super-duper-hit-collection	2026-03-14	3	2026-03-14 18:18:13.452553+00	\N
7ee3e740-b623-4306-808a-3debfc7ec907	2026-03-13 02:09:28.397382+00	2026-03-13 02:09:28.397382+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-13	128	2026-03-13 09:40:04.747142+00	\N
c6557c74-0f81-4a64-9425-6ded1f7714d7	2026-03-13 02:15:12.546046+00	2026-03-13 02:15:12.546046+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-13	30	2026-03-13 09:40:04.803317+00	\N
8179962a-8584-4dce-ac1e-dc6b476fd0dc	2026-03-14 13:31:02.625598+00	2026-03-14 13:31:02.625598+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-14	2	2026-03-14 17:53:14.891459+00	\N
942dcd2e-ac16-4eea-be77-9e3b354d1539	2026-03-13 02:15:12.546093+00	2026-03-13 02:15:12.546093+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-13	26	2026-03-13 09:40:04.803355+00	\N
18894cac-13e7-4c04-86c2-9306bf698bb1	2026-03-13 02:09:32.303334+00	2026-03-13 02:09:32.303334+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-13	96	2026-03-13 09:40:30.960382+00	\N
0cdc29a5-c11f-4249-835c-23bed245ce3d	2026-03-14 16:08:41.312715+00	2026-03-14 16:08:41.312715+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-14	14	2026-03-14 17:48:38.420919+00	\N
a04c8c35-8e16-4d08-9163-ff0ffe5c7902	2026-03-14 13:29:23.331242+00	2026-03-14 13:29:23.331242+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-14	10	2026-03-14 16:47:47.611809+00	\N
edc8a5f7-0402-448c-9754-93eea3837f0b	2026-03-13 02:09:39.854799+00	2026-03-13 02:09:39.854799+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-13	113	2026-03-13 09:40:44.441235+00	\N
6a5a6182-9f09-44c0-9d20-b381f5c82095	2026-03-14 13:31:03.487205+00	2026-03-14 13:31:03.487205+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-14	2	2026-03-14 17:53:15.518961+00	\N
f954f47d-4911-48cf-8287-c8f417491941	2026-03-13 02:19:21.113552+00	2026-03-13 02:19:21.113552+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-13	3	2026-03-13 09:11:43.071626+00	\N
090b2ea3-ec89-4d07-8e24-3c8a4622121f	2026-03-14 16:26:40.05257+00	2026-03-14 16:26:40.05257+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable	2026-03-14	15	2026-03-14 17:54:08.574025+00	\N
2bb2cfbd-b974-4443-a956-a4931257ded7	2026-03-14 13:36:18.156261+00	2026-03-14 13:36:18.156261+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-14	65	2026-03-14 18:18:31.132059+00	\N
93085861-fee3-452f-ad8c-ec14dfc67421	2026-03-14 13:28:56.887495+00	2026-03-14 13:28:56.887495+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-14	41	2026-03-14 16:55:02.464035+00	\N
ee38dd50-0c8f-4664-b64f-586e233abf4a	2026-03-14 16:12:12.510049+00	2026-03-14 16:12:12.510049+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/e8ca9057-1328-4b9b-bf05-f25de381fd47	2026-03-14	2	2026-03-14 16:12:12.599883+00	\N
0f5de73c-722e-481f-a4aa-4356271faba6	2026-03-14 16:12:12.56558+00	2026-03-14 16:12:12.56558+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/e8ca9057-1328-4b9b-bf05-f25de381fd47/reviews	2026-03-14	2	2026-03-14 16:12:12.617202+00	\N
ccc203c4-8d42-4be4-8482-183b10efa238	2026-03-14 16:26:40.650913+00	2026-03-14 16:26:40.650913+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable	2026-03-14	15	2026-03-14 17:54:09.250608+00	\N
9b1108a5-ad07-4b55-8e38-c705f07ce750	2026-03-14 13:06:34.768023+00	2026-03-14 13:06:34.768023+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-14	172	2026-03-14 18:21:03.689101+00	\N
489e6ea3-2523-4f30-b4b4-10f6aa096376	2026-03-14 13:06:34.660024+00	2026-03-14 13:06:34.660024+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-14	274	2026-03-14 18:21:03.668076+00	\N
955a39b6-093f-4462-a951-47981768d7d4	2026-03-14 16:11:10.604165+00	2026-03-14 16:11:10.604165+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-14	18	2026-03-14 17:34:29.047088+00	\N
f0b7490f-4d85-4a73-b8ee-ee8cb3cbe234	2026-03-14 13:06:32.88946+00	2026-03-14 13:06:32.88946+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-14	223	2026-03-14 18:21:03.126097+00	\N
1166d8b2-8632-401f-a01d-d9350f984138	2026-03-14 13:06:34.417788+00	2026-03-14 13:06:34.417788+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-14	254	2026-03-14 18:20:57.492263+00	\N
b142bb2a-b92e-4bb4-8c8d-74df6a57425a	2026-03-14 13:29:23.350573+00	2026-03-14 13:29:23.350573+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-14	65	2026-03-14 18:18:13.41525+00	\N
baa3aeac-31bf-4ce8-9712-0c2f40546fb1	2026-03-14 16:33:44.512235+00	2026-03-14 16:33:44.512235+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-14	2	2026-03-14 16:33:44.653141+00	\N
8fdb93e6-06d1-4d66-bed2-08a669630cd7	2026-03-14 13:31:03.48707+00	2026-03-14 13:31:03.48707+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-14	136	2026-03-14 18:21:03.960879+00	\N
2757774d-6c31-4507-a502-1ad924912dcf	2026-03-14 16:33:44.770287+00	2026-03-14 16:33:44.770287+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-14	1	2026-03-14 16:33:44.770287+00	\N
b3126c0d-40ac-4415-ac6e-decc74485fac	2026-03-14 16:39:28.117587+00	2026-03-14 16:39:28.117587+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-14	32	2026-03-14 18:21:03.960903+00	\N
6dc3533a-3c3b-42f9-a441-d838310abce0	2026-03-14 16:48:34.226158+00	2026-03-14 16:48:34.226158+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-14	1	2026-03-14 16:48:34.226158+00	\N
e47dbd34-2e22-43b1-98f8-64dd34cb29ba	2026-03-14 16:33:44.585156+00	2026-03-14 16:33:44.585156+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-14	6	2026-03-14 16:33:50.999303+00	\N
b42b8b6d-c8a7-45a7-bf3e-e5d7511f1630	2026-03-16 10:10:08.810364+00	2026-03-16 10:10:08.810364+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable	2026-03-16	15	2026-03-16 14:54:14.706736+00	\N
7ad330aa-6ff8-4fbb-9c80-b450065264c8	2026-03-14 16:48:29.19631+00	2026-03-14 16:48:29.19631+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/v8-rgb-transparent-mecha-bluetooth-speaker	2026-03-14	3	2026-03-14 17:53:24.380517+00	\N
72505ad1-68bf-4aa0-a1d9-6491c4e22c13	2026-03-14 16:48:29.930963+00	2026-03-14 16:48:29.930963+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/v8-rgb-transparent-mecha-bluetooth-speaker	2026-03-14	3	2026-03-14 17:53:25.063052+00	\N
267a7165-89dc-404d-a210-6bd2c8ae1ddd	2026-03-14 17:58:23.027077+00	2026-03-14 17:58:23.027077+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/8ce2df4f-bcc4-41e0-a987-5a45f289dd0c	2026-03-14	1	2026-03-14 17:58:23.027077+00	\N
501a076e-d4c6-4be7-bc67-c568409bf9ef	2026-03-16 10:14:51.479087+00	2026-03-16 10:14:51.479087+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/undefined	2026-03-16	6	2026-03-16 14:06:46.754972+00	\N
f69b15d2-6932-4fac-bced-2f9b29b142d6	2026-03-16 10:09:27.825374+00	2026-03-16 10:09:27.825374+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-16	74	2026-03-16 14:55:28.765946+00	\N
ef094244-2bf6-42d1-bc14-3e4ad04c8333	2026-03-16 10:09:33.089729+00	2026-03-16 10:09:33.089729+00	e70063fd-c5b4-458b-a139-6130f2515580	/products	2026-03-16	32	2026-03-16 14:28:27.62374+00	\N
97c5c91b-b74f-4ab9-b8ff-0070cdeb694f	2026-03-16 10:22:30.199856+00	2026-03-16 10:22:30.199856+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/2258108c-3de4-4d32-b37e-99353e63f7ff	2026-03-16	3	2026-03-16 10:28:49.249342+00	\N
46885a11-b3d5-4956-8ba8-61335620f61c	2026-03-16 10:20:05.518427+00	2026-03-16 10:20:05.518427+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/starship-full-cream-milk-powder-1kg	2026-03-16	11	2026-03-16 14:55:43.653285+00	\N
ec4f33e2-3d92-457e-ba68-a6a8149b167a	2026-03-16 10:09:01.086048+00	2026-03-16 10:09:01.086048+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-16	206	2026-03-16 15:31:34.278352+00	\N
164f999b-ec48-410a-8283-d7b8e04f148e	2026-03-14 17:43:24.527418+00	2026-03-14 17:43:24.527418+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants/info	2026-03-14	2	2026-03-14 17:43:24.582994+00	\N
ae8bc22c-06d0-41b6-8145-70af7d8e1a5b	2026-03-16 10:19:09.834575+00	2026-03-16 10:19:09.834575+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items	2026-03-16	19	2026-03-16 11:49:44.40031+00	\N
4d14d5de-36ef-4907-aacd-e8a1618a1090	2026-03-16 10:13:30.230304+00	2026-03-16 10:13:30.230304+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/0b6944c6-f412-46b2-a85d-d06825d5a16d	2026-03-16	1	2026-03-16 10:13:30.230304+00	\N
319c5c82-fcc8-443b-b648-02f2786362d6	2026-03-14 17:29:14.350565+00	2026-03-14 17:29:14.350565+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/3cf88127-1d9a-4c27-967c-e5819cb70edd	2026-03-14	12	2026-03-14 18:03:55.04685+00	\N
7cc0f8b4-72f0-4890-9fcb-d7f840bae2a9	2026-03-16 10:19:44.538358+00	2026-03-16 10:19:44.538358+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/fea35fd8-6d66-46d1-9ec1-0beb12ae1215	2026-03-16	1	2026-03-16 10:19:44.538358+00	\N
de92be20-eaf2-4e4b-bb98-13f8138dced3	2026-03-16 10:11:02.88546+00	2026-03-16 10:11:02.88546+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants/info	2026-03-16	4	2026-03-16 10:12:07.184971+00	\N
8ea8d06c-1a21-4352-a9c7-207f07a631ed	2026-03-16 10:24:34.355106+00	2026-03-16 10:24:34.355106+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c	2026-03-16	18	2026-03-16 12:10:36.355777+00	\N
68ca87d0-3efd-4980-8d08-dfed74a27853	2026-03-14 18:03:55.781437+00	2026-03-14 18:03:55.781437+00	e70063fd-c5b4-458b-a139-6130f2515580	/login	2026-03-14	2	2026-03-14 18:03:55.985493+00	\N
27d7f66f-54a6-45b4-ad57-b061ed02a7c7	2026-03-14 18:04:03.306702+00	2026-03-14 18:04:03.306702+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tenants	2026-03-14	1	2026-03-14 18:04:03.306702+00	\N
a5dec250-384b-4a21-abc7-3b12dea89a47	2026-03-14 18:04:03.317957+00	2026-03-14 18:04:03.317957+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/login	2026-03-14	1	2026-03-14 18:04:03.317957+00	\N
71e59012-8816-410c-9eed-5543dc2a5c55	2026-03-16 10:09:27.504853+00	2026-03-16 10:09:27.504853+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-16	52	2026-03-16 14:17:06.438228+00	\N
a00cd44b-c822-483f-b14a-44458ae28a8f	2026-03-14 18:18:26.534363+00	2026-03-14 18:18:26.534363+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/59728b0e-83b3-45f8-a093-6c559d8f3f57	2026-03-14	7	2026-03-14 18:20:53.488541+00	\N
7d83c6ae-cad6-4a30-ad2b-236d4baf8074	2026-03-14 13:06:34.309321+00	2026-03-14 13:06:34.309321+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-14	254	2026-03-14 18:20:57.59865+00	\N
50ebcb3e-706e-42ce-936b-e5be174a2c0c	2026-03-16 10:22:53.397745+00	2026-03-16 10:22:53.397745+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/omore-one-	2026-03-16	2	2026-03-16 10:23:53.289207+00	\N
bdd63b22-72d6-43aa-8dcd-339a76a65d88	2026-03-14 13:06:34.190759+00	2026-03-14 13:06:34.190759+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-14	406	2026-03-14 18:20:57.667804+00	\N
78a90a09-cc85-442f-9fd7-e206e5092efd	2026-03-14 17:59:15.777734+00	2026-03-14 17:59:15.777734+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/0b6944c6-f412-46b2-a85d-d06825d5a16d	2026-03-14	9	2026-03-14 18:21:00.647046+00	\N
77bbbed1-82a0-42cd-b360-3b9a5a01cc77	2026-03-14 17:58:45.082489+00	2026-03-14 17:58:45.082489+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions	2026-03-14	42	2026-03-14 18:21:00.714581+00	\N
ec0c5dd3-6ab9-4f98-aa46-5c215c01c272	2026-03-14 16:39:27.521464+00	2026-03-14 16:39:27.521464+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/offers	2026-03-14	37	2026-03-14 18:21:03.187137+00	\N
f65b7ab9-6468-47cb-b608-8aedaa2dbb85	2026-03-16 10:18:48.827452+00	2026-03-16 10:18:48.827452+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/4426e21c-e70a-4ea9-9292-e38825ce8fba	2026-03-16	3	2026-03-16 10:28:52.584425+00	\N
b24826f5-545e-4cdc-8cab-df738269c2ec	2026-03-16 10:19:29.25784+00	2026-03-16 10:19:29.25784+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/0754a346-b8d9-41be-ba3b-e1db6de4090e	2026-03-16	1	2026-03-16 10:19:29.25784+00	\N
f823472e-f858-47c3-b870-96ee0b96d348	2026-03-16 10:14:51.478956+00	2026-03-16 10:14:51.478956+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/secend-test	2026-03-16	1	2026-03-16 10:14:51.478956+00	\N
62a887d7-4b92-4091-8993-25848e523802	2026-03-16 10:10:08.47368+00	2026-03-16 10:10:08.47368+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/faqs	2026-03-16	78	2026-03-16 14:55:44.399488+00	\N
c5cc00a2-16af-46da-ad2d-31f6bd47bf81	2026-03-16 10:20:26.795075+00	2026-03-16 10:20:26.795075+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/2699d504-9fc8-4d40-a466-d7f1c65c047b	2026-03-16	1	2026-03-16 10:20:26.795075+00	\N
0ddf7792-ed84-4dae-b5b6-b249df4d94ee	2026-03-16 10:20:06.205032+00	2026-03-16 10:20:06.205032+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/starship-full-cream-milk-powder-1kg	2026-03-16	13	2026-03-16 14:55:44.438429+00	\N
99652b0e-fd9e-4a93-b836-9f05c37299f0	2026-03-16 10:14:52.191511+00	2026-03-16 10:14:52.191511+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/secend-test	2026-03-16	1	2026-03-16 10:14:52.191511+00	\N
3c87fe00-7874-4293-90a9-cc26efd50809	2026-03-16 10:10:08.019221+00	2026-03-16 10:10:08.019221+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable	2026-03-16	13	2026-03-16 14:54:14.030084+00	\N
fd31a82c-419b-45b5-bc27-6ea8f20ebe19	2026-03-16 10:19:15.78062+00	2026-03-16 10:19:15.78062+00	e70063fd-c5b4-458b-a139-6130f2515580	/checkout	2026-03-16	9	2026-03-16 11:36:10.919535+00	\N
8bb15743-5857-452c-8567-7ffa3d29fa7e	2026-03-16 10:08:59.337305+00	2026-03-16 10:08:59.337305+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-16	53	2026-03-16 14:56:28.249402+00	\N
a8146138-aaf7-4ffe-b605-3c4fb7ac223e	2026-03-16 10:13:43.718609+00	2026-03-16 10:13:43.718609+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/59728b0e-83b3-45f8-a093-6c559d8f3f57	2026-03-16	17	2026-03-16 10:28:28.886808+00	\N
c233258c-e99c-48f8-9e57-2ff3e2c3969e	2026-03-16 10:21:12.009806+00	2026-03-16 10:21:12.009806+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/a9787f50-d68e-4801-8b1a-0173fe427aa6	2026-03-16	1	2026-03-16 10:21:12.009806+00	\N
4a2d49f1-a66e-430c-a846-833e62451cd8	2026-03-16 10:23:17.38015+00	2026-03-16 10:23:17.38015+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/specific-product	2026-03-16	2	2026-03-16 10:23:57.841625+00	\N
81704869-307f-42b4-9723-f2b192c4a19e	2026-03-16 10:22:54.119202+00	2026-03-16 10:22:54.119202+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/omore-one-	2026-03-16	2	2026-03-16 10:23:53.971488+00	\N
1dfc53cb-d40a-4270-9d11-b0a3dd11dde9	2026-03-16 10:23:18.063448+00	2026-03-16 10:23:18.063448+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/specific-product	2026-03-16	2	2026-03-16 10:23:58.516893+00	\N
04291af9-8c26-44ce-bae0-126fad10573f	2026-03-16 10:12:36.672854+00	2026-03-16 10:12:36.672854+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions	2026-03-16	42	2026-03-16 10:57:06.018871+00	\N
e8ce7ffd-1148-446a-bd5a-8e32d4be3513	2026-03-16 10:24:34.556443+00	2026-03-16 10:24:34.556443+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/suppliers	2026-03-16	21	2026-03-16 12:32:51.870061+00	\N
9c66fbec-ac0b-4a09-9db0-f6644bcea7c3	2026-03-16 10:24:59.068761+00	2026-03-16 10:24:59.068761+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/25e3ab42-6ac3-4a38-b773-aca27a2a5514	2026-03-16	2	2026-03-16 10:24:59.139435+00	\N
435a0566-24de-4daf-bbad-f3827c08830e	2026-03-16 11:43:21.925844+00	2026-03-16 11:43:21.925844+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/6aff79f0-a4e0-44bb-99e7-f86002702283	2026-03-16	4	2026-03-16 11:49:58.059075+00	\N
8c299800-82f4-4c51-9671-163c88ba3631	2026-03-16 11:12:22.972309+00	2026-03-16 11:12:22.972309+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/3cf88127-1d9a-4c27-967c-e5819cb70edd	2026-03-16	17	2026-03-16 12:11:01.069387+00	\N
7bc308ed-418f-4538-b250-95dcaa220162	2026-03-16 11:34:22.926693+00	2026-03-16 11:34:22.926693+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-5649	2026-03-16	3	2026-03-16 11:34:56.771223+00	\N
804fbb9f-bbdd-4d13-9cd0-bb0fd398a19d	2026-03-16 11:34:23.938112+00	2026-03-16 11:34:23.938112+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-5649	2026-03-16	3	2026-03-16 11:34:57.747479+00	\N
16b795a9-2f41-4e90-af73-19181027709e	2026-03-16 11:34:16.138926+00	2026-03-16 11:34:16.138926+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/d045fdd5-a56d-4c34-a29c-651c80c627c4	2026-03-16	5	2026-03-16 11:35:05.182707+00	\N
ae878630-a2f7-47b7-ae59-036b185507e0	2026-03-16 11:12:42.871676+00	2026-03-16 11:12:42.871676+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-2756	2026-03-16	3	2026-03-16 11:17:57.658297+00	\N
ac133210-104b-4597-a91e-21064d8097a7	2026-03-16 11:12:43.865895+00	2026-03-16 11:12:43.865895+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-2756	2026-03-16	5	2026-03-16 11:17:58.559044+00	\N
abfd9961-e2ea-4de6-a998-6667e975edf4	2026-03-16 10:29:15.115328+00	2026-03-16 10:29:15.115328+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/6049be83-338f-4f1d-a0fb-e748b77eea6c/reviews	2026-03-16	2	2026-03-16 10:29:15.150758+00	\N
080391e6-2c79-490a-b90e-246f2393adf0	2026-03-16 11:11:07.571425+00	2026-03-16 11:11:07.571425+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-16	22	2026-03-16 13:01:59.62878+00	\N
79e9402e-3e7f-4201-85ab-61a9057b45e6	2026-03-16 11:43:47.746042+00	2026-03-16 11:43:47.746042+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-1246	2026-03-16	3	2026-03-16 11:49:59.742035+00	\N
34cda3ee-2795-4950-b370-f4afb4b18062	2026-03-16 11:43:57.583207+00	2026-03-16 11:43:57.583207+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/fe072e61-8f25-48a4-8c3e-dc5232bc6b11	2026-03-16	1	2026-03-16 11:43:57.583207+00	\N
fddee941-1a37-43ef-b9bb-faf3109f66b2	2026-03-16 11:44:02.379915+00	2026-03-16 11:44:02.379915+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/f93092a0-8249-4183-9dad-33decf826081	2026-03-16	1	2026-03-16 11:44:02.379915+00	\N
f5698a1f-3b3f-4c70-8f43-97641da71868	2026-03-16 11:15:56.800189+00	2026-03-16 11:15:56.800189+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/admin/media	2026-03-16	6	2026-03-16 12:12:07.827894+00	\N
6720e324-98a4-4fb7-9ea3-64f923fd6a30	2026-03-16 11:12:24.892858+00	2026-03-16 11:12:24.892858+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/eb2a6421-50dc-467e-b4b0-c4ab93d8608c	2026-03-16	7	2026-03-16 11:32:59.342805+00	\N
77cb2bb8-3529-40d4-a44a-824a00e8e73a	2026-03-16 10:48:13.781302+00	2026-03-16 10:48:13.781302+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/a428fd3f-d756-4d9b-8787-e3fa251f6823	2026-03-16	2	2026-03-16 10:48:21.56479+00	\N
083476f1-658e-4134-93a7-7fd06d8af3ab	2026-03-16 11:44:04.822456+00	2026-03-16 11:44:04.822456+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/c3fb7eb6-da60-4f7d-a3dd-8b214085f834	2026-03-16	1	2026-03-16 11:44:04.822456+00	\N
5082da53-463f-48a4-8f20-e4b8f12d76d5	2026-03-16 11:17:36.306545+00	2026-03-16 11:17:36.306545+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders	2026-03-16	10	2026-03-16 12:19:38.683222+00	\N
c0d70aff-6a85-4d7c-b612-db343e23ffa0	2026-03-16 12:06:06.87658+00	2026-03-16 12:06:06.87658+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-4169	2026-03-16	3	2026-03-16 12:10:35.517043+00	\N
6cddb995-2f3e-4d81-a437-2ea8d09917bf	2026-03-16 10:54:45.745155+00	2026-03-16 10:54:45.745155+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/7f43295c-4b1e-4658-93aa-0f0c7a1e8823	2026-03-16	1	2026-03-16 10:54:45.745155+00	\N
5b762747-4018-433d-a0e3-eef99bb13432	2026-03-16 11:12:28.453344+00	2026-03-16 11:12:28.453344+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/reviews/public	2026-03-16	20	2026-03-16 14:20:55.945009+00	\N
0f27b1ed-c5ee-4eb3-9df9-86c932ca96e0	2026-03-16 11:43:48.832518+00	2026-03-16 11:43:48.832518+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-1246	2026-03-16	3	2026-03-16 11:50:00.507789+00	\N
8e4a6bb5-5a0d-4ecf-ada6-e5c41979dce9	2026-03-16 11:33:41.749715+00	2026-03-16 11:33:41.749715+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/payment/init	2026-03-16	1	2026-03-16 11:33:41.749715+00	\N
9862cc1e-ed6d-487f-a166-66216b433674	2026-03-16 11:33:25.445387+00	2026-03-16 11:33:25.445387+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-9025	2026-03-16	2	2026-03-16 11:33:44.882787+00	\N
5d03af3a-aba8-4811-bf43-3a1f35161d9a	2026-03-16 11:33:26.429442+00	2026-03-16 11:33:26.429442+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-9025	2026-03-16	2	2026-03-16 11:33:45.717263+00	\N
4105ab4e-d8ef-40cc-8998-d5c7f9be54ab	2026-03-16 11:33:09.695075+00	2026-03-16 11:33:09.695075+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/1f359a0a-150a-4a97-9a0c-609969999f3a	2026-03-16	4	2026-03-16 11:34:10.904254+00	\N
554c69c4-234f-4e80-a1df-9ad0b5e162ce	2026-03-16 11:44:05.996447+00	2026-03-16 11:44:05.996447+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/9436d1a9-3114-4cf5-8a52-0256fca823a3	2026-03-16	1	2026-03-16 11:44:05.996447+00	\N
fa6ef9de-2e4b-4401-9806-0221c86cc52c	2026-03-16 11:33:41.597704+00	2026-03-16 11:33:41.597704+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/sync	2026-03-16	2	2026-03-16 11:45:36.303942+00	\N
f1d4f2b5-d453-46c2-b667-bfb589ff224a	2026-03-16 11:51:50.294491+00	2026-03-16 11:51:50.294491+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/833efbb1-8911-4401-8322-fa96eb4d1af9	2026-03-16	4	2026-03-16 11:56:01.337459+00	\N
7bedadfe-ba05-42d9-b61f-44ebe7288728	2026-03-16 11:50:28.05648+00	2026-03-16 11:50:28.05648+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-8046	2026-03-16	1	2026-03-16 11:50:28.05648+00	\N
902dd536-1c7c-4036-9594-9e20c8660806	2026-03-16 11:50:33.098453+00	2026-03-16 11:50:33.098453+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/abbdbed4-b050-4b0d-a74a-f8c82dfc0b7c	2026-03-16	1	2026-03-16 11:50:33.098453+00	\N
f2bc7ff0-2841-4d90-82ec-c111ca8e260d	2026-03-16 11:05:10.355298+00	2026-03-16 11:05:10.355298+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/cash-flow	2026-03-16	8	2026-03-16 12:30:59.142041+00	\N
8bb88432-426a-42be-b97f-402f99b9f35a	2026-03-16 11:35:19.078659+00	2026-03-16 11:35:19.078659+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-3194	2026-03-16	4	2026-03-16 11:39:37.020024+00	\N
9a9f5193-cee5-49ed-b63a-4cce4aad3b32	2026-03-16 11:36:06.79755+00	2026-03-16 11:36:06.79755+00	e70063fd-c5b4-458b-a139-6130f2515580	/cart	2026-03-16	2	2026-03-16 11:36:18.643114+00	\N
362b20d4-c4d2-41f3-bcbb-c327c1523c21	2026-03-16 11:36:07.941236+00	2026-03-16 11:36:07.941236+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart/items/f4a40d3d-18ab-4406-97dd-412c0d0c6632	2026-03-16	2	2026-03-16 11:36:19.57406+00	\N
1e58a196-c967-45b9-b95e-c3da2a1cd820	2026-03-16 11:35:20.162621+00	2026-03-16 11:35:20.162621+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-3194	2026-03-16	4	2026-03-16 11:39:37.811446+00	\N
cc77a1aa-d38a-45f3-b443-6faa525872ae	2026-03-16 11:35:13.664021+00	2026-03-16 11:35:13.664021+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/b673f747-5a18-4531-bb93-703a5371ba61	2026-03-16	7	2026-03-16 11:41:17.747869+00	\N
75ed850b-f091-44b1-b8cf-f2486ec76ae2	2026-03-16 11:50:18.53927+00	2026-03-16 11:50:18.53927+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/168463e6-ae44-46ef-a77e-e4c16c08ff45	2026-03-16	4	2026-03-16 11:51:02.559908+00	\N
06eecbb8-e6bd-4243-ae01-5333cf859669	2026-03-16 11:51:50.498114+00	2026-03-16 11:51:50.498114+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/8ba9259b-7165-4e59-b217-491a16b9f37c	2026-03-16	2	2026-03-16 11:51:50.728039+00	\N
a03a78fc-aee6-4f64-9494-dd6bd122b424	2026-03-16 10:09:00.597571+00	2026-03-16 10:09:00.597571+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-16	227	2026-03-16 14:56:29.233218+00	\N
227708be-2e4b-499d-90fc-d83fa26e6693	2026-03-16 11:50:26.902031+00	2026-03-16 11:50:26.902031+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-8046	2026-03-16	1	2026-03-16 11:50:26.902031+00	\N
e75bb6ce-379e-43ec-830f-de7d91db9404	2026-03-16 12:05:55.085155+00	2026-03-16 12:05:55.085155+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/c86ac217-8371-45f9-87fe-9348f303c798	2026-03-16	6	2026-03-16 12:11:56.184838+00	\N
b62b43b5-db26-4c7c-a30d-687897500248	2026-03-16 11:51:24.23207+00	2026-03-16 11:51:24.23207+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-starship-full-cream-milk-powder-1kg-0246	2026-03-16	1	2026-03-16 11:51:24.23207+00	\N
c9018db1-a081-436d-b67d-294457396d00	2026-03-16 11:51:25.213088+00	2026-03-16 11:51:25.213088+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-0246	2026-03-16	1	2026-03-16 11:51:25.213088+00	\N
a41ecc16-4b75-4394-99d0-8be44bdedcd3	2026-03-16 11:51:10.729261+00	2026-03-16 11:51:10.729261+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/e6841b4d-2666-4044-aef4-d9d884bc0f17	2026-03-16	4	2026-03-16 11:59:23.729616+00	\N
35c4d7d3-8fbf-480e-bef7-10f81af19701	2026-03-16 12:06:07.952307+00	2026-03-16 12:06:07.952307+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-starship-full-cream-milk-powder-1kg-4169	2026-03-16	3	2026-03-16 12:10:36.482606+00	\N
4ca04f57-176e-4f14-84fd-a23500b68c5c	2026-03-16 10:09:28.823061+00	2026-03-16 10:09:28.823061+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers	2026-03-16	76	2026-03-16 14:55:29.405874+00	\N
31803cef-8614-4aa4-a646-5df97f1c792a	2026-03-16 14:20:50.749652+00	2026-03-16 14:20:50.749652+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	2026-03-16	11	2026-03-16 14:56:25.442711+00	\N
9cba47b3-163c-4fb9-8421-7788b7d9f31a	2026-03-16 12:11:00.273529+00	2026-03-16 12:11:00.273529+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-3490	2026-03-16	1	2026-03-16 12:11:00.273529+00	\N
ab49268c-9088-4e13-a64e-fda20c3d620e	2026-03-16 12:11:01.252648+00	2026-03-16 12:11:01.252648+00	e70063fd-c5b4-458b-a139-6130f2515580	/landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-3490	2026-03-16	1	2026-03-16 12:11:01.252648+00	\N
03826526-b598-44bc-abb3-bf290204451f	2026-03-16 12:10:53.964815+00	2026-03-16 12:10:53.964815+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/0358aa72-fd8b-499c-b7bd-ae252c149959	2026-03-16	4	2026-03-16 12:11:53.815447+00	\N
82460cf8-b901-48c0-810c-e8009dbc6c55	2026-03-16 14:27:52.81989+00	2026-03-16 14:27:52.81989+00	e70063fd-c5b4-458b-a139-6130f2515580	/products/v8-rgb-transparent-mecha-bluetooth-speaker	2026-03-16	1	2026-03-16 14:27:52.81989+00	\N
13cb84a5-7fa3-4dbd-93c7-6f65da16bd23	2026-03-17 16:16:04.383366+00	2026-03-17 16:16:04.383366+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/team/invite	2026-03-17	2	2026-03-17 16:16:37.991289+00	\N
476b254e-0a40-4963-af70-38a5998aee72	2026-03-17 16:13:52.695685+00	2026-03-17 16:13:52.695685+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/team	2026-03-17	7	2026-03-17 16:16:38.052106+00	\N
59ac3476-dfae-4c0f-abd7-00fda482a260	2026-03-17 15:59:14.39547+00	2026-03-17 15:59:14.39547+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/categories	2026-03-17	4	2026-03-17 16:19:33.401866+00	\N
7859d11a-9311-4f46-963c-f1087140fb82	2026-03-16 10:08:59.245282+00	2026-03-16 10:08:59.245282+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-16	228	2026-03-16 14:56:29.267357+00	\N
d24e5c93-7bfe-4107-ab94-ebd8576b9939	2026-03-16 10:09:00.707082+00	2026-03-16 10:09:00.707082+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-16	231	2026-03-16 14:56:29.29429+00	\N
3dd84e3c-5400-4f2b-ae03-156f9acfff57	2026-03-16 14:06:46.748837+00	2026-03-16 14:06:46.748837+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/promotions/slug/new-offer	2026-03-16	1	2026-03-16 14:06:46.748837+00	\N
d1b0decd-8424-439d-a06f-f14ebae1b491	2026-03-16 10:09:00.477588+00	2026-03-16 10:09:00.477588+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-16	414	2026-03-16 14:56:29.333046+00	\N
11565823-0dac-4ca4-8db2-2c3b392cfd7c	2026-03-16 10:09:01.003714+00	2026-03-16 10:09:01.003714+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-16	419	2026-03-16 14:56:29.347633+00	\N
4aff485a-67ea-4291-a507-62bcb55fb888	2026-03-16 14:06:47.524872+00	2026-03-16 14:06:47.524872+00	e70063fd-c5b4-458b-a139-6130f2515580	/offers/new-offer	2026-03-16	1	2026-03-16 14:06:47.524872+00	\N
23920686-ddec-44f2-8c8d-1437916a94e4	2026-03-16 14:17:42.366382+00	2026-03-16 14:17:42.366382+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/slug/sdfasdf	2026-03-16	2	2026-03-16 14:18:03.440863+00	\N
a58147ac-7419-4988-8426-fa81636869b5	2026-03-16 12:19:45.654469+00	2026-03-16 12:19:45.654469+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions	2026-03-16	13	2026-03-16 12:28:55.513216+00	\N
9ce09e9f-701c-4afb-8b9b-8346f3b2cb71	2026-03-16 12:12:53.304329+00	2026-03-16 12:12:53.304329+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/inventory-transactions/stock-summary	2026-03-16	29	2026-03-16 12:28:55.803797+00	\N
55d4b55f-07c5-4150-8d03-dd1333c08f54	2026-03-16 14:17:43.253701+00	2026-03-16 14:17:43.253701+00	e70063fd-c5b4-458b-a139-6130f2515580	/sdfasdf	2026-03-16	2	2026-03-16 14:18:04.319529+00	\N
04e65dc9-d058-48c5-9c49-2c4c5df1128d	2026-03-17 16:13:06.05342+00	2026-03-17 16:13:06.05342+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/dashboard	2026-03-17	6	2026-03-17 16:19:05.799412+00	\N
6eff56e3-a718-4395-93d6-61f204a034ff	2026-03-16 12:32:00.091239+00	2026-03-16 12:32:00.091239+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/bb094c4b-6fb5-40c9-bac7-ca47d349c3b4/payments	2026-03-16	1	2026-03-16 12:32:00.091239+00	\N
b7612d95-2550-447c-97ed-7b8326ce859b	2026-03-16 12:31:11.742224+00	2026-03-16 12:31:11.742224+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders/bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	2026-03-16	3	2026-03-16 12:32:00.160275+00	\N
f20ca6ba-3f20-4934-9212-496f019d8936	2026-03-16 12:30:32.713073+00	2026-03-16 12:30:32.713073+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/supplier-ledger/2f62a619-47d3-453c-a040-994509e8d923	2026-03-16	2	2026-03-16 12:32:17.306002+00	\N
136397ba-4407-42c2-9a24-ad39d071be25	2026-03-16 12:13:14.57864+00	2026-03-16 12:13:14.57864+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/profit-loss	2026-03-16	6	2026-03-16 12:32:44.424186+00	\N
59149138-61ad-4a3b-881f-d6c928aac904	2026-03-17 15:59:14.618847+00	2026-03-17 15:59:14.618847+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/brands	2026-03-17	4	2026-03-17 16:19:33.45848+00	\N
792067fa-3dc4-44b7-9fb5-c2fd66387b38	2026-03-16 14:06:57.372031+00	2026-03-16 14:06:57.372031+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/profile	2026-03-16	2	2026-03-16 14:06:57.480076+00	\N
e2b5585d-11be-4d4b-a963-4c628fe2f71d	2026-03-16 12:31:02.373814+00	2026-03-16 12:31:02.373814+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/finance-summary	2026-03-16	4	2026-03-16 12:32:46.190154+00	\N
5e83b764-6626-4ea2-bcb8-559c10dd80b1	2026-03-16 14:06:57.415356+00	2026-03-16 14:06:57.415356+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/orders/user/e8083ac4-0762-487a-b5fb-40e38599a435	2026-03-16	2	2026-03-16 14:06:57.505391+00	\N
598bc6ee-83d9-410d-8857-d8e3a4e94c29	2026-03-16 14:06:57.648222+00	2026-03-16 14:06:57.648222+00	e70063fd-c5b4-458b-a139-6130f2515580	/profile	2026-03-16	1	2026-03-16 14:06:57.648222+00	\N
24cff175-f412-495e-807e-759ce5ee8833	2026-03-17 15:59:14.50863+00	2026-03-17 15:59:14.50863+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products	2026-03-17	8	2026-03-17 16:19:33.4869+00	\N
33475914-28ec-4d30-a540-9e47bc164112	2026-03-16 12:14:16.927335+00	2026-03-16 12:14:16.927335+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/purchase-orders	2026-03-16	8	2026-03-16 12:32:54.032298+00	\N
6b303b41-e721-43b2-baaf-bccd06ba70ad	2026-03-17 15:59:14.923287+00	2026-03-17 15:59:14.923287+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages	2026-03-17	4	2026-03-17 16:19:33.511261+00	\N
7edf532b-45d2-4cda-af05-ec3de3b1bc1b	2026-03-17 15:59:15.575039+00	2026-03-17 15:59:15.575039+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/cart	2026-03-17	4	2026-03-17 16:19:33.526295+00	\N
31def924-e7be-4dda-8444-9af604f5c6ed	2026-03-16 14:55:19.354862+00	2026-03-16 14:55:19.354862+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/leads	2026-03-16	4	2026-03-16 14:55:26.761336+00	\N
14483675-39e5-4df1-9d09-2e0b2b46bbb0	2026-03-17 16:13:10.780595+00	2026-03-17 16:13:10.780595+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/report/analytics	2026-03-17	6	2026-03-17 16:19:06.53193+00	\N
2a0a777a-6865-4fd3-a382-53a56a1a2950	2026-03-16 14:27:52.190239+00	2026-03-16 14:27:52.190239+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/products/slug/v8-rgb-transparent-mecha-bluetooth-speaker	2026-03-16	1	2026-03-16 14:27:52.190239+00	\N
450ca790-8e3a-4dc8-b1ab-a5ae8d188713	2026-03-17 16:15:06.199366+00	2026-03-17 16:15:06.199366+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users	2026-03-17	2	2026-03-17 16:15:06.298404+00	\N
a9c9ff4c-f8dd-41d1-99d2-c4f51273b316	2026-03-16 10:52:30.070086+00	2026-03-16 10:52:30.070086+00	e70063fd-c5b4-458b-a139-6130f2515580	/	2026-03-16	23	2026-03-16 14:56:10.298921+00	\N
d1c57726-876f-4c57-a192-d0cb36168869	2026-03-16 10:09:28.82298+00	2026-03-16 10:09:28.82298+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/tracking/page-view	2026-03-16	203	2026-03-16 14:56:10.298852+00	\N
a2064b57-abf8-4ee4-9326-83e44c6f33a0	2026-03-17 15:59:11.427992+00	2026-03-17 15:59:11.427992+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/pages/home	2026-03-17	3	2026-03-17 16:19:32.121123+00	\N
eaf67389-368c-45f1-86e4-6e1c68a1aeb8	2026-03-17 15:59:11.16857+00	2026-03-17 15:59:11.16857+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/settings	2026-03-17	10	2026-03-17 16:25:42.821497+00	\N
f3f37a76-7f94-405c-9f2d-a882b3c4d6fa	2026-03-17 16:16:26.694518+00	2026-03-17 16:16:26.694518+00	e70063fd-c5b4-458b-a139-6130f2515580	/api/v1/users/team/invitations/dd4955ad-8e72-49c6-8581-657a8cb59d8d	2026-03-17	1	2026-03-17 16:16:26.694518+00	\N
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, title, slug, is_home_page, "order", sections, meta_title, meta_description, typography, status, tenant_id, created_at, updated_at, user_id, og_image) FROM stdin;
a7e90e7c-6a58-4f0a-9403-ed3fd3e3ca0c	Home-page	/	t	0	[{"id": "block-1csljz174", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-71dtmiesq", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "100%", "marginLeft": "", "paddingTop": 0, "gridColumns": 1, "marginRight": "", "paddingLeft": "", "layoutPreset": "container-full", "paddingRight": "", "mobileDisplay": "flex", "paddingBottom": 0, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": ""}, "children": [{"id": "block-kvvcy2pxp", "type": "banner", "styles": {"height": "600px", "opacity": 1, "fontSize": "", "marginTop": "", "textAlign": "center", "textColor": "#3e1e1e", "paddingTop": "10px", "borderColor": "", "borderStyle": "", "borderWidth": "", "buttonColor": "#e63333", "paddingLeft": "20px", "borderRadius": "", "mobileHeight": "600px", "paddingRight": "20px", "sublineColor": "rgba(255, 255, 255, 0.9)", "headlineColor": "#aa7474", "paddingBottom": "10px", "overlayOpacity": 37, "backgroundColor": "", "buttonTextColor": "#2563eb"}, "disabled": false, "settings": {"slides": [{"id": "block-ozm2gsq7b", "subline": "Discover the latest trends in luxury fashion and accessories.", "headline": "Summer Collection 2026", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", "primaryButtonLink": "/products", "primaryButtonText": "Shop Now", "secondaryButtonLink": "/about", "secondaryButtonText": "Learn More"}, {"id": "item-1773330350985", "subline": "Discover the latest trends in luxury fashion and accessories.", "headline": "New Slide", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", "primaryButtonLink": "/products", "primaryButtonText": "Shop Now"}]}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-xvqzc0qs1", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-urasaqhg7", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "1280px", "position": "", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "paddingLeft": "", "layoutPreset": "grid", "paddingRight": "", "mobileDisplay": "grid", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileFlexDirection": "", "mobileJustifyContent": "center", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-721pt0nv8", "type": "category-grid", "styles": {"textAlign": "center", "cardBorder": "none", "cardRadius": "none", "paddingTop": 0, "paddingBottom": 0, "mobileTextAlign": "center"}, "disabled": false, "settings": {"count": 10, "items": [], "title": "All Categoris", "source": "all", "columns": 6, "mobileColumns": 2}}, {"id": "block-3h4id3guw", "type": "product-slider", "styles": {"textAlign": "left", "paddingTop": 0, "paddingBottom": 0, "mobileTextAlign": "left", "mobilePaddingLeft": "", "mobilePaddingRight": ""}, "disabled": false, "settings": {"source": "all", "columns": 4, "headline": "Featured Product", "collectionId": "3da1ebc3-b228-41a3-926b-0f7db1df7419", "mobileColumns": 2}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-kk82rkly6", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-za4qj53bv", "type": "row", "styles": {"display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "layoutPreset": "grid", "paddingBottom": 0, "gridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-t7dt5hxlq", "type": "brand-grid", "styles": {"textAlign": "center", "cardShadow": "none", "paddingTop": "", "paddingBottom": "50px", "backgroundColor": "#f5efef", "cardBackgroundColor": "#e10e0e"}, "disabled": false, "settings": {"title": "Shop by Barnd", "columns": 6, "mobileColumns": 1}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-554cz8uco", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-tnkox5lcl", "type": "row", "styles": {"display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "layoutPreset": "grid", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-yrzicn7p7", "type": "newsletter", "styles": {"textAlign": "center", "paddingTop": "10px", "marginBottom": "1px", "paddingBottom": "14px"}, "disabled": false, "settings": {"title": "Join our Newletter", "description": "Get to update news"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-tevefx1hd", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40, "backgroundColor": "#e5b3b3"}, "children": [{"id": "block-u0utjl9bd", "type": "row", "styles": {"width": "100%", "display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": "10px", "gridColumns": 1, "marginRight": "auto", "paddingLeft": "10px", "borderRadius": "50px", "layoutPreset": "grid", "paddingRight": "10px", "mobileDisplay": "grid", "paddingBottom": "10px", "backgroundColor": "#f4ebeb", "mobileGridColumns": 1, "gridTemplateColumns": "repeat(1, 1fr)", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-wvrxw003y", "type": "stats-counter", "styles": {"textAlign": "center", "cardBorder": "medium", "cardRadius": "101px", "cardShadow": "medium", "fontWeight": "500", "paddingTop": "10px", "borderRadius": "50px", "paddingBottom": "10px", "backgroundColor": "", "cardBackgroundColor": "#d32727"}, "disabled": false, "settings": {"items": [{"id": "item-1773335785755", "label": "New Stat", "value": "100+"}, {"id": "item-1773336223030", "label": "New Stat", "value": "100+"}, {"id": "item-1773336236006", "label": "New Stat", "value": "100+"}, {"id": "item-1773336389601", "label": "New Stat", "value": "100+"}], "title": "Statas Overview", "subline": "dddd"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-1ulyx2ddb", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40, "backgroundColor": "#25225E"}, "children": [{"id": "block-9n0b56ix3", "type": "row", "styles": {"width": "100%", "display": "block", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "paddingLeft": "16px", "layoutPreset": "container", "paddingRight": "16px", "paddingBottom": 0, "mobileGridColumns": 1, "gridTemplateColumns": "", "mobileGridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-4fd3aukuw", "type": "offer-banner", "styles": {"textAlign": "right", "paddingTop": "50px", "buttonColor": "#ea3434", "paddingLeft": "", "borderRadius": "50px", "mobileHeight": "", "paddingBottom": "50px", "overlayOpacity": 100, "buttonTextColor": "#708cc7", "mobilePaddingTop": "", "mobilePaddingLeft": "", "mobilePaddingBottom": ""}, "disabled": false, "settings": {"layout": "left", "endDate": "2026-03-16T22:31:00.000Z", "subline": "Limited Time", "headline": "New Offers", "buttonLink": "dddddd", "buttonText": "eeeeee", "backgroundImage": "", "secondaryButtonLink": "sdfasdf", "secondaryButtonText": "eee"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-hmc4hyra3", "type": "review-slider", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-f0138mu76", "type": "text-block", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-e5x29x3fn", "type": "image-block", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {}}, {"id": "block-cege6sbts", "type": "divider", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {"style": "dashed"}}, {"id": "block-9troct5ch", "type": "section", "styles": {"paddingTop": 40, "paddingBottom": 40}, "children": [{"id": "block-rjd3r26vq", "type": "row", "styles": {"width": "100%", "display": "block", "maxWidth": "100%", "marginLeft": "", "paddingTop": 0, "gridColumns": 1, "marginRight": "", "paddingLeft": "", "layoutPreset": "container-full", "paddingRight": "", "paddingBottom": 0, "gridTemplateColumns": ""}, "children": [{"id": "block-uk1n6101v", "type": "faq-section", "styles": {"textAlign": "center", "textColor": "#0d0c0c", "paddingTop": 0, "headlineColor": "#343232", "paddingBottom": 0}, "disabled": false, "settings": {"items": [{"id": "item-1773374310151", "answer": "Answer goes herew", "question": "New Question"}, {"id": "item-1773374313856", "answer": "Answer goes herew", "question": "New Question"}, {"id": "item-1773374316551", "answer": "Answer goes herew", "question": "New Question"}], "title": "Fap", "layout": "accordion", "subline": "eeeeeeee", "gridColumns": "2", "mobileColumns": "1"}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "block-x824aliac", "type": "contact", "styles": {"textAlign": "center", "labelAlign": "left", "paddingTop": "10px", "titleAlign": "left", "buttonColor": "#ecd0d0", "paddingLeft": "10px", "paddingRight": "10px", "sublineColor": "#ea3939", "headlineColor": "#f01919", "paddingBottom": "10px", "backgroundColor": "#f4f1f1", "inputBorderColor": "#e7d9d9"}, "disabled": false, "settings": {"cardLayout": "right"}}, {"id": "block-v9evykq6w", "type": "new-arrivals", "styles": {"paddingTop": 0, "paddingBottom": 0}, "disabled": false, "settings": {"count": 4, "source": "all", "headline": "New Arrivals", "mobileColumns": 2}}]			{"headingFontFamily": "Inter", "headingFontWeight": "800", "paragraphFontSize": ""}	published	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-11 15:31:37.871705+00	2026-03-16 14:55:01.920651+00	\N	\N
5a2efb69-434f-476d-8432-eb9287744268	Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable Landing Page	landing-portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable-7353	f	0	[{"id": "section-banner", "type": "banner", "styles": {"height": 500, "textAlign": "center", "textColor": "#FFFFFF", "paddingTop": 0, "buttonColor": "#FFFFFF", "sublineColor": "#ECECEC", "headlineColor": "#FFFFFF", "paddingBottom": 0, "buttonTextColor": "#000000"}, "disabled": false, "settings": {"slides": [{"id": "slide-1", "image": "http://localhost:3900/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp", "subline": "Premium quality you can trust. Limited time offer.", "headline": "Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable", "buttonLink": "#landing-checkout", "buttonText": "Order Now", "overlayOpacity": 40}]}}, {"id": "section-main-container", "type": "section", "styles": {"paddingTop": 80, "paddingBottom": 100, "backgroundColor": "#F9FAFB"}, "children": [{"id": "row-inner", "type": "row", "styles": {"gap": 40, "maxWidth": 1100, "alignItems": "stretch", "marginLeft": "auto", "marginRight": "auto", "paddingLeft": 20, "paddingRight": 20}, "children": [{"id": "col-product-image", "type": "column", "styles": {"flex": 1, "border": "1px solid #F1F5F9", "padding": 40, "boxShadow": "0 10px 40px rgba(0,0,0,0.03)", "borderRadius": "32px", "backgroundColor": "#FFFFFF"}, "children": [{"id": "img-block", "type": "image-block", "styles": {"imageRadius": "24px", "imageShadow": "0 15px 35px rgba(0,0,0,0.08)"}, "disabled": false, "settings": {"image": "http://localhost:3900/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp"}}], "disabled": false, "settings": {}}, {"id": "col-product-info", "type": "column", "styles": {"flex": 1.2, "border": "1px solid #F1F5F9", "display": "flex", "padding": 50, "boxShadow": "0 10px 40px rgba(0,0,0,0.03)", "borderRadius": "32px", "flexDirection": "column", "justifyContent": "center", "backgroundColor": "#FFFFFF"}, "children": [{"id": "badge-text", "type": "text-block", "styles": {"marginBottom": 24}, "disabled": false, "settings": {"html": "<span style=\\"background: #EEF2FF; color: #4F46E5; padding: 8px 16px; border-radius: 999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;\\">Special Offer</span>"}}, {"id": "product-heading", "type": "heading", "styles": {"color": "#111827", "fontSize": "46px", "textAlign": "left", "fontWeight": "900", "lineHeight": "1.2", "marginBottom": 20}, "disabled": false, "settings": {"text": "Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable", "level": "h1"}}, {"id": "product-desc", "type": "text-block", "styles": {"textAlign": "left"}, "disabled": false, "settings": {"html": "<div style=\\"font-size: 18px; line-height: 1.8; color: #4B5563; margin-bottom: 32px;\\"><ul><li><p>[Smart LED Display]Stay cool and keep track of your power usage with our smart LED display mini fan. Intuitive and easy to read, it shows your battery level and fan speed at a glance, perfect for use in the library, outdoors, indoors, and as a gift for Mother's Day, birthday, anniversary, Father's Day, children's Day, the mini handheld fan will surprise the recipient.</p></li><li><p>[Small Handheld Fan] new and fashionable colors, available in cherry pink, deep sea blue, violet purple, snow white, and forest green, many colors to choose from, practical and portable fan, perfect as a gift for friends, girlfriends, family, classmates, relatives, children, elders, boyfriends, girlfriends, colleagues. A great choice for a summer holiday gift.</p></li><li><p>[Mobile phone stand design] Need a hands-free solution for staying cool and connected? small handheld fan phone stand design lets you watch videos and listen to music while feeling the breeze, It can also be used as a makeup fan, face fan, eyelash fan dryer, and skincare fan to help set your make-up and skincare.</p></li><li><p>[5-Speeds Portable Fan]Adjust the airflow to your liking with five customizable speed settings. From a gentle breeze to a powerful gust, we've got you covered, As a new 2023 portable fan for travel, the compact size is designed to be a travel essential. With dimensions of 1.8*3.5*7.4inch and a weight of 0.41lbs, it can fit into a handbag very easily, making it a travel essential for women.</p></li><li><p>[Perfume Fan]Indulge in the ultimate summer relaxation experience with our aromatic fan. Simply add your favorite fragrance to the easy-to-install scent pad and enjoy the refreshing cool breeze from the mini fan, the small portable fan is perfect as a travel gift for your girlfriends and friends, with a pink fan for an added surprise.</p></li><li><p>[Multiple Power Supply Options] Charge up a small fan easily using our versatile USB and type-c charging ports. Convenient and fast, you'll never be without a cool breeze.</p></li><li><p>[Lazy Neck Fan]Small fan comes with an adjustable neck lanyard that can be hung around your neck, freeing your hands to feel the cool breeze from the portable fan, a portable fan for travel, think of the portability and convenience of enjoying the cool breeze without having to free up a pair of hands while you play in the heat of the theme park. The wearable fan is a theme park essential.</p></li></ul><ul><li><p>product model - N15</p></li><li><p>product power -2.5W</p></li><li><p>Battery voltage -3.7V</p></li><li><p>Input voltage/current -5V--1Amax</p></li><li><p>product material -ABS/PC/ circuit board</p></li><li><p>product size -188*90*46.5mm</p></li><li><p>Base size -64*64*16mm</p></li><li><p>product weight -190g</p></li></ul><p></p></div>"}}, {"id": "product-features", "type": "text-block", "styles": {"textAlign": "left"}, "disabled": false, "settings": {"html": "\\n                                                            <div style=\\"display: grid; grid-template-columns: 1fr; gap: 16px;\\">\\n                                                                <div style=\\"display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;\\"><div style=\\"min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;\\">✓</div> Authentic Quality Assured</div>\\n                                                                <div style=\\"display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;\\"><div style=\\"min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;\\">✓</div> Fast Doorstep Delivery</div>\\n                                                                <div style=\\"display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;\\"><div style=\\"min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;\\">✓</div> Cash on Delivery Available</div>\\n                                                            </div>\\n                                                        "}}], "disabled": false, "settings": {}}], "disabled": false, "settings": {}}, {"id": "checkout-container", "type": "checkout", "styles": {"maxWidth": 950, "marginLeft": "auto", "paddingTop": 60, "marginRight": "auto", "paddingBottom": 0}, "disabled": false, "settings": {"title": "Complete Your Order", "productId": "3cf88127-1d9a-4c27-967c-e5819cb70edd", "buttonText": "Order Now - Cash on Delivery", "showProductSummary": true}}], "disabled": false, "settings": {}}, {"id": "block-18qjjewll", "type": "row", "styles": {"display": "grid", "maxWidth": "1280px", "marginLeft": "auto", "paddingTop": 0, "gridColumns": 1, "marginRight": "auto", "layoutPreset": "grid", "paddingBottom": 0, "gridTemplateColumns": "repeat(1, 1fr)"}, "children": [{"id": "block-3nm969e2c", "type": "offer-banner", "styles": {"paddingTop": 0, "paddingBottom": 0}, "settings": {}}], "settings": {}}]			\N	published	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 15:41:27.526567+00	2026-03-19 15:43:35.744689+00	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, user_id, transaction_id, amount, currency, method, status, gateway_response, tenant_id, created_at, updated_at) FROM stdin;
483b4046-e87d-42ff-9240-1d07bbdd6607	1a0e6291-299a-428b-a73e-0b70e2d81fc9	\N	MANUAL_COD_1773934268907	559.00	BDT	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 15:31:08.907214+00	2026-03-19 15:31:08.907214+00
66e2cc2b-620a-497e-820a-450d71c00ee9	e19abe50-a04c-4b5e-a3ea-17353d7a73c9	\N	MANUAL_COD_1774076748227	150.00	USD	cod	SUCCESS	{"note": "Manual update from admin dashboard"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 07:05:48.22769+00	2026-03-21 07:05:48.22769+00
a847e994-16c7-445a-a874-3719ba2053e4	16a08afb-bcab-4d49-9652-cde2310491c4	\N	POS_1774090024712	141.75	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:47:04.711925+00	2026-03-21 10:47:04.711925+00
1d3d4992-ea9d-464e-b107-3fe14753c746	9a2b5794-0b1d-45da-9b6a-492929358f74	\N	POS_1774090099074	103.50	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:19.073389+00	2026-03-21 10:48:19.073389+00
a1f04e08-2565-416e-87bd-3b9522c08195	b63a40a7-20fe-4a55-ab6d-6728acfbc142	\N	POS_1774090139222	193.50	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:48:59.221638+00	2026-03-21 10:48:59.221638+00
06a98edb-1081-453b-a272-4e1d4359fa09	02b694b1-c8c2-4824-9d1c-849a0e84ccbc	\N	POS_1774090220152	193.50	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 10:50:20.152109+00	2026-03-21 10:50:20.152109+00
3740f04b-cce3-49fb-937c-7c31c3054c8c	fe73a98f-8de9-423e-8a9d-d888a006286c	\N	POS_1774091127116	51.75	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 11:05:27.114997+00	2026-03-21 11:05:27.114997+00
36e941df-5a80-443a-9ac0-418a42d123b4	2048d9fb-ef5e-4abf-bc01-53d6459d13cf	\N	POS_1774147517396	90.00	BDT	cod	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 02:45:17.395235+00	2026-03-22 02:45:17.395235+00
7db9938e-e11a-486e-865d-f1a47dc604d5	f38cece6-c8ac-499e-8b5b-b14257a92191	\N	POS_1774149824271	111.75	USD	cash	SUCCESS	{"note": "POS Walk-in Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:23:44.268836+00	2026-03-22 03:23:44.268836+00
c8d99f94-9025-4aff-82f4-98ef5ab0a8e4	5efda44a-15f0-4a43-b834-3025f252c02c	\N	POS_1774150358361	150.00	USD	sslcommerz	PENDING	{"note": "POS Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:32:38.35939+00	2026-03-22 03:32:38.35939+00
d7159d2c-08f8-42ce-93f4-3f27182da8fa	1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9	\N	TRAN_1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9_1774150442501	150.00	USD	BKASH-BKash	SUCCESS	{"error": "", "amount": "12477.75", "status": "VALID", "val_id": "26032293408AhEuCpObVzdwC8K", "card_no": "", "tran_id": "TRAN_1f44aa0c-b4d2-496d-9e2a-28bd8935d5d9_1774150442501", "value_a": "http://nice.localhost:3000/api/payment", "value_b": "d918424e-f653-4068-bb6e-caec287bc2ad", "value_c": "", "value_d": "", "currency": "BDT", "store_id": "ecomm6648b03fa5d37", "base_fair": "0.00", "card_type": "BKASH-BKash", "tran_date": "2026-03-22 09:34:03", "card_brand": "MOBILEBANKING", "risk_level": "0", "risk_title": "Safe", "verify_key": "amount,bank_tran_id,base_fair,card_brand,card_issuer,card_issuer_country,card_issuer_country_code,card_no,card_sub_brand,card_type,currency,currency_amount,currency_rate,currency_type,error,risk_level,risk_title,status,store_amount,store_id,tran_date,tran_id,val_id,value_a,value_b,value_c,value_d", "card_issuer": "BKash Mobile Banking", "verify_sign": "69f8af6307259f29c8112104c9725c99", "bank_tran_id": "26032293408UPhTwT4iuAT6JNV", "store_amount": "12165.81", "currency_rate": "83.1850", "currency_type": "USD", "card_sub_brand": "Classic", "currency_amount": "150.00", "subscription_id": "", "verify_sign_sha2": "92b3431fbde4d832628adb1d0630e3eed16ebea367e0879f4aefcb54cedaa578", "card_issuer_country": "Bangladesh", "card_issuer_country_code": "BD"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:34:10.907623+00	2026-03-22 03:34:10.907623+00
8fe426dc-47ef-4e33-a655-65761c10f4aa	8a6d45b6-9b73-48b8-bae3-3e9e14b19ec0	\N	POS_1774150489599	51.75	USD	sslcommerz	PENDING	{"note": "POS Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:34:49.597537+00	2026-03-22 03:34:49.597537+00
16903ff7-e06b-4545-ba9e-eb82302dd95a	9209d41c-1463-4857-9985-a8453f0c88bb	\N	POS_1774150976285	51.75	USD	sslcommerz	PENDING	{"note": "POS Sale"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:42:56.284503+00	2026-03-22 03:42:56.284503+00
b2d956fc-28ca-43c0-bb7c-a10724256512	9209d41c-1463-4857-9985-a8453f0c88bb	\N	TRAN_9209d41c-1463-4857-9985-a8453f0c88bb_1774150976302	51.75	USD	NAGAD-Nagad	SUCCESS	{"error": "", "amount": "4304.82", "status": "VALID", "val_id": "26032294302wCp0b1ddNihETXs", "card_no": "", "tran_id": "TRAN_9209d41c-1463-4857-9985-a8453f0c88bb_1774150976302", "value_a": "http://nice.localhost:3000/api/payment", "value_b": "d918424e-f653-4068-bb6e-caec287bc2ad", "value_c": "", "value_d": "", "currency": "BDT", "store_id": "ecomm6648b03fa5d37", "base_fair": "0.00", "card_type": "NAGAD-Nagad", "tran_date": "2026-03-22 09:42:57", "card_brand": "MOBILEBANKING", "risk_level": "0", "risk_title": "Safe", "verify_key": "amount,bank_tran_id,base_fair,card_brand,card_issuer,card_issuer_country,card_issuer_country_code,card_no,card_sub_brand,card_type,currency,currency_amount,currency_rate,currency_type,error,risk_level,risk_title,status,store_amount,store_id,tran_date,tran_id,val_id,value_a,value_b,value_c,value_d", "card_issuer": "Nagad", "verify_sign": "fbbe387f497ef1a3e4a8e665f9e1fb85", "bank_tran_id": "26032294302cEhBu106UatYd6d", "store_amount": "4197.20", "currency_rate": "83.1850", "currency_type": "USD", "card_sub_brand": "Classic", "currency_amount": "51.75", "subscription_id": "", "verify_sign_sha2": "748d239df6f6e593abac633249fa411cf4906dc64147c05b90d42445b01c4afb", "card_issuer_country": "Bangladesh", "card_issuer_country_code": "BD"}	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 03:43:04.981659+00	2026-03-22 03:43:04.981659+00
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
ccbd9d29-9394-4742-baaf-de5cb3b1a6aa	size	lg,sm,xl,xxl,md	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.904099+00	2026-03-14 16:12:07.904099+00	\N
22d7c24c-f15e-48ea-a625-12a833754ca5	Size	lg,ms,md,xl,xxl	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.282597+00	2026-03-14 17:38:16.282597+00	\N
ae39c18a-1c72-48c7-ad04-a494c9c7532b	size	lg,sm,md	113d2fc0-651e-4440-acc8-a126fbbd6501	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 06:13:51.784389+00	2026-03-21 06:13:51.784389+00	\N
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, sku, price, stock, images, combination, product_id, tenant_id, created_at, updated_at, user_id, low_stock_threshold) FROM stdin;
52bb1925-7cdf-47ac-9e4d-5f9e55d393bd	SKU-96IM5HUYM	4000.00	118	\N	{"Size": "lg"}	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.293052+00	2026-03-14 17:38:16.349096+00	\N	5
71d1564e-37df-40e5-ae3f-194dc730391b	SKU-YNAMTE3WE	3000.00	118	\N	{"Size": "ms"}	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.298009+00	2026-03-14 17:38:16.361649+00	\N	5
0b9e2455-1a67-4a81-93c5-c80afaec9a66	SKU-6D7UQY2EX	2000.00	118	\N	{"Size": "md"}	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.302173+00	2026-03-14 17:38:16.370496+00	\N	5
f6d8b208-f510-4128-9764-35b817cecbdb	SKU-SGALI729V	2500.00	118	\N	{"Size": "xl"}	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.305765+00	2026-03-14 17:38:16.37575+00	\N	5
8418bc0b-4678-4e55-a291-93811ca866ab	SKU-SWVDWRFP1	3498.00	118	\N	{"Size": "xxl"}	3cf88127-1d9a-4c27-967c-e5819cb70edd	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 17:38:16.309955+00	2026-03-14 17:38:16.385335+00	\N	5
bea456ab-c588-464c-88eb-609919b1d8b2	SKU-CZ6OSHMO8	1000.00	600	\N	{"Size": "xl"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-01 12:59:46.502367+00	\N	5
4efa887e-7f62-4d3b-9edd-fc467896c39d	SKU-UPKPO0MII	500.00	60	\N	{"size": "md"}	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.917791+00	2026-03-16 12:26:55.69594+00	\N	5
fbca5f2f-8129-422d-8996-65618cf26ceb	SKU-7QPJHV70O	500.00	55	\N	{"size": "lg"}	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.907886+00	2026-03-16 12:28:10.412336+00	\N	5
5179bc44-ae7e-4c4e-8745-62e018ad83e8	SKU-3R8FD3EL5	1000.00	600	\N	{"Size": "md"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-05 15:40:03.552689+00	\N	5
80b5fca1-5ed4-4f21-8eae-1d815126418f	SKU-0AYXCVZ86	1000.00	600	\N	{"Size": "sm"}	25e3ab42-6ac3-4a38-b773-aca27a2a5514	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.502367+00	2026-03-05 15:46:42.323116+00	\N	5
98f915b0-8a1a-423c-aee4-f6dc880d5e8a	SKU-T3TA63LSZ	500.00	50	\N	{"size": "sm"}	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.911836+00	2026-03-14 16:12:07.955348+00	\N	5
642df2c1-7529-46df-9ec9-a53733089e6e	SKU-S6MLH1ZTJ	500.00	50	\N	{"size": "xl"}	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.913927+00	2026-03-14 16:12:07.961373+00	\N	5
86118e4f-c759-45a3-ac00-240f5229c8f4	SKU-NELHBR20B	500.00	50	\N	{"size": "xxl"}	e8ca9057-1328-4b9b-bf05-f25de381fd47	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.915857+00	2026-03-14 16:12:07.969362+00	\N	5
df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	SKU-N8S39SXLJ	50.00	2	\N	{"size": "sm"}	113d2fc0-651e-4440-acc8-a126fbbd6501	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 06:13:51.798978+00	2026-03-22 03:23:44.245453+00	\N	5
5b7c9b65-e633-4023-a3fc-94fd80199889	SKU-B5XCQGCVD	50.00	1	\N	{"size": "md"}	113d2fc0-651e-4440-acc8-a126fbbd6501	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 06:13:51.793318+00	2026-03-22 03:34:49.567439+00	\N	5
5c944d61-4c72-4ac2-9c2b-0380444d8c64	SKU-FWECVWZVQ	50.00	0	\N	{"size": "lg"}	113d2fc0-651e-4440-acc8-a126fbbd6501	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 06:13:51.804468+00	2026-03-22 03:42:56.251979+00	\N	5
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, short_description, price, is_review, discount_amount, images, stock, status, category_id, brand_id, landing_page_id, faq_source, faq_ids, tenant_id, created_at, updated_at, supplier_id, user_id, low_stock_threshold, discount_type, tax_rate, meta_title, meta_description, og_image, is_new, is_hot, is_sale) FROM stdin;
25e3ab42-6ac3-4a38-b773-aca27a2a5514	new product test	new-product-test	<p>asdfasdf</p>		1000.00	t	100.00	http://localhost:3900/uploads/1772363368735_gowtam.jpg	600	active	4d13c2cd-a72a-4b25-94d6-2fc8d1a2b786	ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	\N	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:59:46.491235+00	2026-03-01 12:59:46.491235+00	\N	\N	5	percentage	0.00	\N	\N	\N	f	f	f
e8ca9057-1328-4b9b-bf05-f25de381fd47	premium step cotton panjabi for mens super duper hit collection	premium-step-cotton-panjabi-for-mens-super-duper-hit-collection	<ul><li><p>Febrics: Hering Cotton</p></li><li><p>৩৮ সাইজ (S) = লং-৩৮ ইঞ্চি, চেস্ট-৪০ ইঞ্চি। 38 size ( S ) = 38 Lenght ,Chest - 40 inc</p></li><li><p>৪০ সাইজ (M)= লং-৪০ ইঞ্চি, চেস্ট-৪২ ইঞ্চি। 40 size ( M ) = 40 Lenght ,Chest - 42 inc</p></li><li><p>৪২ সাইজ (L) = লং-৪২ ইঞ্চি, চেস্ট-৪৪ ইঞ্চি। 42 size ( L ) = 42 Lenght ,Chest- 44 inc</p></li><li><p>৪৪ সাইজ (XL)= লং-৪৪ ইঞ্চি, চেস্ট-৪৬ ইঞ্চি। 44 size ( XL ) = 46 Lenght ,Chest- 46 inc</p></li><li><p>Type: Sami long Embroidery work Panjabi</p></li><li><p>Production Country: Bangladesh</p></li><li><p>100% Export Quality.</p></li><li><p>Color:(As Given Picture)</p></li><li><p>#panjabi</p></li><li><p>#panjabi for men</p></li><li><p>Casual Type: Semi Long Embroidery Panjabi Gender: Men Production Country: Bangladesh 100% Export Quality.</p></li><li><p>#Kurtas</p></li><li><p>#panjabi for men</p></li></ul><ul><li><p>Febrics: Hering Cotton</p></li><li><p>৩৮ সাইজ (S) = লং-৩৮ ইঞ্চি, চেস্ট-৪০ ইঞ্চি। 38 size ( S ) = 38 Lenght ,Chest - 40 inc</p></li><li><p>৪০ সাইজ (M)= লং-৪০ ইঞ্চি, চেস্ট-৪২ ইঞ্চি। 40 size ( M ) = 40 Lenght ,Chest - 42 inc</p></li><li><p>৪২ সাইজ (L) = লং-৪২ ইঞ্চি, চেস্ট-৪৪ ইঞ্চি। 42 size ( L ) = 42 Lenght ,Chest- 44 inc</p></li><li><p>৪৪ সাইজ (XL)= লং-৪৪ ইঞ্চি, চেস্ট-৪৬ ইঞ্চি। 44 size ( XL ) = 46 Lenght ,Chest- 46 inc</p></li><li><p>Type: Sami long Embroidery work Panjabi</p></li><li><p>Production Country: Bangladesh</p></li><li><p>100% Export Quality.</p></li><li><p>Color:(As Given Picture)</p></li></ul><p></p>	premium step cotton panjabi for mens super duper hit collection\n	500.00	t	49.99	http://localhost:3900/uploads/1773504675048_836dc89d762049da6e10a76a547fccc3.webp	10	active	3a7305b9-bd66-44da-b384-74996adca5cd	830a3146-c34f-4748-8e21-96f4a5590aca	\N	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:12:07.894988+00	2026-03-16 12:28:27.414706+00	2f62a619-47d3-453c-a040-994509e8d923	\N	10	percentage	0.00	\N	\N	\N	f	f	f
6049be83-338f-4f1d-a0fb-e748b77eea6c	Starship Full Cream Milk Powder - 1kg	starship-full-cream-milk-powder-1kg	<ul><li><p>Product type: Milk Powder</p></li><li><p>Capacity: 1000gm</p></li><li><p>Brand: Starship</p></li></ul><ul><li><p>Starship Full Cream Milk Powder - 1kg</p></li></ul><ul><li><p>Product type: Milk Powder</p></li><li><p>Capacity: 1000gm.</p></li><li><p>Brand: Starship</p></li></ul><p></p>	Brand: Starship\n\n\n\n\n\nStarship Full Cream Milk Powder - 1kg	659.00	t	100.00	http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp,http://localhost:3900/uploads/1772471380322_imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg	96	active	4d13c2cd-a72a-4b25-94d6-2fc8d1a2b786	ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	c86ac217-8371-45f9-87fe-9348f303c798	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02 16:35:44.686932+00	2026-03-19 15:26:43.65739+00	\N	\N	5	percentage	0.00	\N	\N	\N	f	f	f
3cf88127-1d9a-4c27-967c-e5819cb70edd	Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable	portable-handheld-personal-rechargeable-fan-led-digital-display-90-adjustable	<ul><li><p>[Smart LED Display]Stay cool and keep track of your power usage with our smart LED display mini fan. Intuitive and easy to read, it shows your battery level and fan speed at a glance, perfect for use in the library, outdoors, indoors, and as a gift for Mother's Day, birthday, anniversary, Father's Day, children's Day, the mini handheld fan will surprise the recipient.</p></li><li><p>[Small Handheld Fan] new and fashionable colors, available in cherry pink, deep sea blue, violet purple, snow white, and forest green, many colors to choose from, practical and portable fan, perfect as a gift for friends, girlfriends, family, classmates, relatives, children, elders, boyfriends, girlfriends, colleagues. A great choice for a summer holiday gift.</p></li><li><p>[Mobile phone stand design] Need a hands-free solution for staying cool and connected? small handheld fan phone stand design lets you watch videos and listen to music while feeling the breeze, It can also be used as a makeup fan, face fan, eyelash fan dryer, and skincare fan to help set your make-up and skincare.</p></li><li><p>[5-Speeds Portable Fan]Adjust the airflow to your liking with five customizable speed settings. From a gentle breeze to a powerful gust, we've got you covered, As a new 2023 portable fan for travel, the compact size is designed to be a travel essential. With dimensions of 1.8*3.5*7.4inch and a weight of 0.41lbs, it can fit into a handbag very easily, making it a travel essential for women.</p></li><li><p>[Perfume Fan]Indulge in the ultimate summer relaxation experience with our aromatic fan. Simply add your favorite fragrance to the easy-to-install scent pad and enjoy the refreshing cool breeze from the mini fan, the small portable fan is perfect as a travel gift for your girlfriends and friends, with a pink fan for an added surprise.</p></li><li><p>[Multiple Power Supply Options] Charge up a small fan easily using our versatile USB and type-c charging ports. Convenient and fast, you'll never be without a cool breeze.</p></li><li><p>[Lazy Neck Fan]Small fan comes with an adjustable neck lanyard that can be hung around your neck, freeing your hands to feel the cool breeze from the portable fan, a portable fan for travel, think of the portability and convenience of enjoying the cool breeze without having to free up a pair of hands while you play in the heat of the theme park. The wearable fan is a theme park essential.</p></li></ul><ul><li><p>product model - N15</p></li><li><p>product power -2.5W</p></li><li><p>Battery voltage -3.7V</p></li><li><p>Input voltage/current -5V--1Amax</p></li><li><p>product material -ABS/PC/ circuit board</p></li><li><p>product size -188*90*46.5mm</p></li><li><p>Base size -64*64*16mm</p></li><li><p>product weight -190g</p></li></ul><p></p>	Portable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable\nPortable Handheld Personal Rechargeable Fan LED Digital Display 90°Adjustable\n	5000.00	t	500.00	http://localhost:3900/uploads/1773505027468_9e04ea553b896e80bc884f5cdeffe160.webp,http://localhost:3900/uploads/1773509331608_96ee562e41468f26213d162c82cad2c4.webp	0	active	\N	ae9d9ae1-d45b-4e6b-bf9b-7153dd15d38a	5a2efb69-434f-476d-8432-eb9287744268	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:17:45.044169+00	2026-03-19 15:41:27.583061+00	2f62a619-47d3-453c-a040-994509e8d923	\N	10	percentage	0.00	\N	\N	\N	f	f	f
9cb3cf39-c99d-405a-9f8b-e24106aa4f51	V8 Rgb Transparent Mecha Bluetooth Speaker	v8-rgb-transparent-mecha-bluetooth-speaker	<ul><li><p>যারাযারা ড্রপ শিপিং বিজনেস করতে চান Daraz চ্যাট অপশনে মেসেজ দিবেন l</p></li><li><p>🛠️ পণ্যের নাম: V8 Transparent Bluetooth Speaker</p></li><li><p>📡 ব্লুটুথ ভার্সন: V5.0</p></li><li><p>🔋 ব্যাটারি ক্যাপাসিটি: 1200mAh</p></li><li><p>⏳ প্লেব্যাক সময়: 1.5 - 2.5 ঘণ্টা</p></li><li><p>🌐 ট্রান্সমিশন রেঞ্জ: ১০ মিটার</p></li><li><p>🔊 সর্বোচ্চ পাওয়ার: 10W</p></li><li><p>📏 পণ্যের সাইজ: 165 x 60 x 64mm</p></li><li><p>প্যাকেজে অন্তর্ভুক্ত:</p></li><li><p>১টি V8 স্পিকার</p></li><li><p>১টি USB কেবল</p></li><li><p>১টি নির্দেশিকা ম্যানুয়াল</p></li><li><p>১টি প্যাকেজিং বক্স</p></li></ul><ul><li><p>360° Stereo Sound: ক্রিস্টাল ক্লিয়ার সাউন্ড এবং ডিপ বেস।</p></li><li><p>🌈 RGB Light Sync: আপনার প্রিয় মিউজিকের সঙ্গে আলোর চমৎকার সুরেলা সমন্বয়।</p></li><li><p>🎤 TWS Mode: দুটি স্পিকার একত্রে কানেক্ট করুন এবং উপভোগ করুন ডুয়াল সাউন্ড সিস্টেম।</p></li><li><p>⚡ Type-C Charging: দ্রুত চার্জিং সুবিধা।</p></li><li><p>📶 Bluetooth 5.0: শক্তিশালী সংযোগ এবং দ্রুত পেয়ারিং।</p></li><li><p>👜 Compact Design: সহজে বহনযোগ্য এবং স্টাইলিশ।</p></li></ul><p></p>	V8 Rgb Transparent Mecha Bluetooth Speaker\nV8 Rgb Transparent Mecha Bluetooth Speaker\n	500.00	t	60.00	http://localhost:3900/uploads/1773504833048_ad10c6b0d18c4d008d7cb43e55df763a.webp	199	active	3da1ebc3-b228-41a3-926b-0f7db1df7419	ba18a43a-967a-4b05-a809-89c97f5abb11	\N	manual		e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14 16:14:25.025476+00	2026-03-19 16:16:41.239492+00	2f62a619-47d3-453c-a040-994509e8d923	\N	10	percentage	0.00	\N	\N	\N	f	f	f
113d2fc0-651e-4440-acc8-a126fbbd6501	test-1	test-1	<p>asdfasdf</p>	dasdf	50.00	t	10.00	http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png	0	active	\N	c6076449-6dd1-4dfb-a04b-2a230bd03495	\N	manual		d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:32:40.862663+00	2026-03-21 06:13:51.773826+00	d0215f61-39f2-4030-8216-6a300eefb8ac	\N	5	percentage	15.00	\N	\N	\N	f	f	f
fcfb7fbe-1a64-4963-b6e7-b55089b4132e	new test product	new-test-product	<p>new test product</p>	new test product	100.00	t	10.00	http://localhost:3900/uploads/1774070273555_82696b96-2a4a-4eed-b415-e1a80c9459b6.png	43	active	\N	c6076449-6dd1-4dfb-a04b-2a230bd03495	\N	manual		d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:18:02.688465+00	2026-03-22 04:02:33.602749+00	d0215f61-39f2-4030-8216-6a300eefb8ac	\N	5	percentage	0.00	\N	\N	\N	f	f	f
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, created_at, updated_at, name, slug, description, "promotionType", value, "targetType", target_id, min_order_value, start_date, end_date, is_active, tenant_id, user_id) FROM stdin;
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
5deed6e0-8e65-4cdb-9946-9c1575e19d40	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.920526+00	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e8ca9057-1328-4b9b-bf05-f25de381fd47	50	500.00	fbca5f2f-8129-422d-8996-65618cf26ceb	\N
324234af-44f2-4460-9c10-0f2a2304a022	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.920526+00	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e8ca9057-1328-4b9b-bf05-f25de381fd47	50	500.00	98f915b0-8a1a-423c-aee4-f6dc880d5e8a	\N
241e2fbc-a9ed-4f08-a95d-7cdf6b3fd3b2	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.920526+00	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e8ca9057-1328-4b9b-bf05-f25de381fd47	50	500.00	642df2c1-7529-46df-9ec9-a53733089e6e	\N
22ec9873-851c-4870-bbf5-a11d88b32ff3	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.920526+00	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e8ca9057-1328-4b9b-bf05-f25de381fd47	50	500.00	86118e4f-c759-45a3-ac00-240f5229c8f4	\N
958f0f65-f3d2-4a6f-b211-c0096fd62084	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.920526+00	8bd6dec1-9868-4f48-b102-1e2233ce8c2b	e8ca9057-1328-4b9b-bf05-f25de381fd47	50	500.00	4efa887e-7f62-4d3b-9edd-fc467896c39d	\N
c83315a8-ce01-436a-a9f8-e45887794819	2026-03-14 16:14:25.033511+00	2026-03-14 16:14:25.046402+00	aab4223a-17ac-48e5-a7b1-cb6aa856f23b	9cb3cf39-c99d-405a-9f8b-e24106aa4f51	100	500.00	\N	\N
d814f18b-d410-41fc-8d76-f18c8c33340a	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.067363+00	58ba1296-5daf-420d-a87a-f4feecc364c6	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
96bb62ab-f40a-4e35-9926-3157ad7e8c53	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.067363+00	58ba1296-5daf-420d-a87a-f4feecc364c6	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
b2d3b752-b24e-48e9-9d64-4c1c4cb57b96	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.067363+00	58ba1296-5daf-420d-a87a-f4feecc364c6	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
93d3e4a7-036b-4206-8d46-f184f11bf39c	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.067363+00	58ba1296-5daf-420d-a87a-f4feecc364c6	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
96664822-aa02-441f-8d5b-9f36a8d39a95	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.067363+00	58ba1296-5daf-420d-a87a-f4feecc364c6	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
7f7846a1-1b34-4db2-b717-42d04801ad42	2026-03-14 17:38:16.315054+00	2026-03-14 17:38:16.315054+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	4000.00	52bb1925-7cdf-47ac-9e4d-5f9e55d393bd	\N
573f5a04-ab6b-4cd0-b80a-047a4fc73271	2026-03-14 17:38:16.315054+00	2026-03-14 17:38:16.315054+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	3000.00	71d1564e-37df-40e5-ae3f-194dc730391b	\N
d1136faa-db4d-4aac-b07e-7311cfb4cff6	2026-03-14 17:38:16.315054+00	2026-03-14 17:38:16.315054+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	2000.00	0b9e2455-1a67-4a81-93c5-c80afaec9a66	\N
c9b5b271-353a-4e3d-8407-971b6723f406	2026-03-14 17:38:16.315054+00	2026-03-14 17:38:16.315054+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	2500.00	f6d8b208-f510-4128-9764-35b817cecbdb	\N
1494a9a3-8b51-4a71-b42f-39d5cfb9c652	2026-03-14 17:38:16.315054+00	2026-03-14 17:38:16.315054+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	3498.00	8418bc0b-4678-4e55-a291-93811ca866ab	\N
7c006a3f-4850-4bd7-9e1f-91f1e52cc5b6	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.465949+00	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
e5bc52b8-2157-4278-8140-d77c41fdf3e5	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.465949+00	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
fee6b58e-e28f-416e-935e-bd8813b78b13	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.465949+00	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
7f21ecc4-5b49-487b-b6f1-3a34d58ec40f	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.465949+00	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
d9cddaca-a7ab-4ca4-b340-0c1a8847a630	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.465949+00	17eddf06-b2a2-4373-ac3e-b7f3003dacd7	3cf88127-1d9a-4c27-967c-e5819cb70edd	118	5000.00	\N	\N
afef9b77-55f3-4125-8db7-f8bf1b1d312a	2026-03-21 05:32:40.885416+00	2026-03-21 05:32:40.885416+00	1052e821-58b2-4fc6-a2c1-864b251ffbc9	113d2fc0-651e-4440-acc8-a126fbbd6501	900	50.00	\N	\N
097f17e6-cf80-49c0-aea4-ff025cc57df1	2026-03-21 05:32:40.885416+00	2026-03-21 05:32:40.885416+00	1052e821-58b2-4fc6-a2c1-864b251ffbc9	113d2fc0-651e-4440-acc8-a126fbbd6501	500	50.00	\N	\N
e7b7078d-73fd-4fc0-85ea-7cc4a2fab5d1	2026-03-21 05:32:40.885416+00	2026-03-21 05:32:40.885416+00	1052e821-58b2-4fc6-a2c1-864b251ffbc9	113d2fc0-651e-4440-acc8-a126fbbd6501	400	50.00	\N	\N
d540565e-610b-48c1-b7bd-63905c8cde2a	2026-03-21 06:04:43.086227+00	2026-03-21 06:04:43.086227+00	f9c4561a-682c-4f7b-8e0f-e6013b148f17	113d2fc0-651e-4440-acc8-a126fbbd6501	400	50.00	\N	\N
cf92e97c-530b-4266-a601-046eee19c19c	2026-03-21 06:04:43.086227+00	2026-03-21 06:04:43.086227+00	f9c4561a-682c-4f7b-8e0f-e6013b148f17	113d2fc0-651e-4440-acc8-a126fbbd6501	500	50.00	\N	\N
f010d80c-47bd-47dc-b6fe-ba22809cb8ed	2026-03-21 06:04:43.086227+00	2026-03-21 06:04:43.086227+00	f9c4561a-682c-4f7b-8e0f-e6013b148f17	113d2fc0-651e-4440-acc8-a126fbbd6501	900	50.00	\N	\N
2891fb43-668e-4505-8188-2dad445a6fcd	2026-03-21 06:13:51.808845+00	2026-03-21 06:13:51.808845+00	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	5b7c9b65-e633-4023-a3fc-94fd80199889	\N
0c7d0b51-089d-451f-b42b-f401b5a46d11	2026-03-21 06:13:51.808845+00	2026-03-21 06:13:51.808845+00	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	df5e0101-70f0-4ae3-90f8-ae70cd73f9bd	\N
e28c884f-d40e-44ce-bdfa-49d02e75f051	2026-03-21 06:13:51.808845+00	2026-03-21 06:13:51.808845+00	0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	5c944d61-4c72-4ac2-9c2b-0380444d8c64	\N
594b0aa2-709f-47c6-8398-cc26bcf3f9d5	2026-03-21 06:05:45.047178+00	2026-03-21 06:05:45.047178+00	09ba357d-1130-418c-b1fc-63daff85724c	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	\N	\N
e6be63f4-dfb0-4090-8b55-1a07a4ef419e	2026-03-21 06:05:45.047178+00	2026-03-21 06:05:45.047178+00	09ba357d-1130-418c-b1fc-63daff85724c	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	\N	\N
c4271635-5888-43f1-91f3-7fd941123af3	2026-03-21 06:05:45.047178+00	2026-03-21 06:05:45.047178+00	09ba357d-1130-418c-b1fc-63daff85724c	113d2fc0-651e-4440-acc8-a126fbbd6501	5	50.00	\N	\N
bc70e3d5-ff5f-4ecb-94d0-4d68ccb31f36	2026-03-21 08:21:45.037556+00	2026-03-21 08:21:48.115424+00	d3560277-b889-45c1-aa3e-465e54cf8a08	fcfb7fbe-1a64-4963-b6e7-b55089b4132e	1	100.00	\N	\N
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, created_at, updated_at, reference_number, supplier_id, status, total_amount, tenant_id, payment_status, paid_amount, user_id) FROM stdin;
b1ad4dbe-cbd1-4e27-9645-aea39f740918	2026-03-04 17:44:32.660718+00	2026-03-04 17:44:39.209004+00	PO-201061	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	659.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
7dab6627-7bbe-44b3-8f61-6c09f0291013	2026-03-04 18:51:18.456821+00	2026-03-04 18:51:20.98374+00	PO-264141	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
2a38347c-37cc-4178-857f-2de233c4ab34	2026-03-05 15:40:00.640934+00	2026-03-05 15:40:03.541844+00	PO-120247	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	3000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
8f803440-73e5-49f1-94e9-9e0b4d3076b1	2026-03-05 15:42:40.945913+00	2026-03-05 15:42:42.776556+00	PO-329141	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	1318.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
6b9378ed-3393-49c6-9624-4343621967a8	2026-03-05 15:44:28.514091+00	2026-03-05 16:28:09.391751+00	PO-455751	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PARTIAL	1000.00	\N
8bd6dec1-9868-4f48-b102-1e2233ce8c2b	2026-03-14 16:12:07.920526+00	2026-03-14 16:12:07.935324+00	INITIAL_PREMIUM-STEP-COTTON-PANJABI-FOR-MENS-SUPER-DUPER-HIT-COLLECTION_1773504727919	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	125000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
aab4223a-17ac-48e5-a7b1-cb6aa856f23b	2026-03-14 16:14:25.033511+00	2026-03-14 16:14:25.046402+00	INITIAL_V8-RGB-TRANSPARENT-MECHA-BLUETOOTH-SPEAKER_1773504865032	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	50000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
58ba1296-5daf-420d-a87a-f4feecc364c6	2026-03-14 16:17:45.067363+00	2026-03-14 16:17:45.082278+00	INITIAL_PORTABLE-HANDHELD-PERSONAL-RECHARGEABLE-FAN-LED-DIGITAL-DISPLAY-90-ADJUSTABLE_1773505065066	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	2950000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
17eddf06-b2a2-4373-ac3e-b7f3003dacd7	2026-03-14 17:29:21.465949+00	2026-03-14 17:29:21.485559+00	INITIAL_VAR_PORTABLE-HANDHELD-PERSONAL-RECHARGEABLE-FAN-LED-DIGITAL-DISPLAY-90-ADJUSTABLE_1773509361464	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	2950000.00	e70063fd-c5b4-458b-a139-6130f2515580	PENDING	0.00	\N
bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	2026-03-14 17:38:16.315054+00	2026-03-16 12:32:00.091136+00	INITIAL_VAR_PORTABLE-HANDHELD-PERSONAL-RECHARGEABLE-FAN-LED-DIGITAL-DISPLAY-90-ADJUSTABLE_1773509896313	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	1769764.00	e70063fd-c5b4-458b-a139-6130f2515580	PAID	1769764.00	\N
e57e5892-31ff-4016-8a89-1f05d6fc6309	2026-03-04 18:44:54.295996+00	2026-03-19 15:47:34.849538+00	PO-854591	2f62a619-47d3-453c-a040-994509e8d923	RECEIVED	10000.00	e70063fd-c5b4-458b-a139-6130f2515580	PAID	10000.00	\N
1052e821-58b2-4fc6-a2c1-864b251ffbc9	2026-03-21 05:32:40.885416+00	2026-03-21 05:32:40.900661+00	INITIAL_TEST-1_1774071160884	d0215f61-39f2-4030-8216-6a300eefb8ac	RECEIVED	90000.00	d918424e-f653-4068-bb6e-caec287bc2ad	PENDING	0.00	\N
f9c4561a-682c-4f7b-8e0f-e6013b148f17	2026-03-21 06:04:43.086227+00	2026-03-21 06:04:43.103918+00	INITIAL_VAR_TEST-1_1774073083085	d0215f61-39f2-4030-8216-6a300eefb8ac	RECEIVED	90000.00	d918424e-f653-4068-bb6e-caec287bc2ad	PENDING	0.00	\N
09ba357d-1130-418c-b1fc-63daff85724c	2026-03-21 06:05:45.047178+00	2026-03-21 06:05:45.062118+00	INITIAL_VAR_TEST-1_1774073145046	d0215f61-39f2-4030-8216-6a300eefb8ac	RECEIVED	750.00	d918424e-f653-4068-bb6e-caec287bc2ad	PENDING	0.00	\N
0cce6e33-9bbf-41a7-8c78-e6e216ecd11e	2026-03-21 06:13:51.808845+00	2026-03-21 06:13:51.827583+00	INITIAL_VAR_TEST-1_1774073631807	d0215f61-39f2-4030-8216-6a300eefb8ac	RECEIVED	750.00	d918424e-f653-4068-bb6e-caec287bc2ad	PENDING	0.00	\N
d3560277-b889-45c1-aa3e-465e54cf8a08	2026-03-21 08:21:45.037556+00	2026-03-21 08:21:48.115424+00	PO-287640	d0215f61-39f2-4030-8216-6a300eefb8ac	RECEIVED	100.00	d918424e-f653-4068-bb6e-caec287bc2ad	PENDING	0.00	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, customer_name, customer_email, rating, comment, status, tenant_id, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, logo, brand_name, site_description, contact_email, contact_phone, whatsapp_phone, address, currency, currency_symbol, supported_currencies, social_links, marketing, smtp, payment, pathao_courier, steadfast_courier, navbar, trust_badges, tenant_id, created_at, updated_at, user_id, footer, products_page, single_product_page, offers_page, shipping_config, robots_txt) FROM stdin;
bee53502-484f-428a-8915-f2eacfad341e	\N	poly	Welcome to poly! Premium products and excellent service.	poly@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:25.936659+00	2026-03-02 16:37:25.940507+00	\N	\N	\N	\N	\N	\N	\N
59da5430-bccd-4dcb-8134-97b17661199f	\N	arko	Welcome to arko! Premium products and excellent service.	arkopaul@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	37aee4da-502c-481c-87c7-5996d2e52a8a	2026-03-19 15:25:05.056563+00	2026-03-19 15:25:05.061196+00	\N	\N	\N	\N	\N	\N	\N
b41651b4-24e1-4024-b0f3-36cde7afe4fc		nice	Welcome to nice! Premium products and excellent service.	nice@gmail.com				BDT	$	[]	{"twitter": "", "facebook": "", "linkedin": "", "instagram": ""}	{"facebookPixelId": "", "googleAnalyticsId": "", "googleSiteVerification": "", "facebookDomainVerification": ""}	{"from": "", "host": "", "pass": "", "port": 587, "user": "", "secure": false}	{"stripeSecretKey": "", "sslCommerzStoreId": "ecomm6648b03fa5d37", "sslCommerzIsSandbox": true, "stripePublishableKey": "", "sslCommerzStorePassword": "ecomm6648b03fa5d37@ssl"}	{"sandboxMode": false, "pathaoStoreId": "", "pathaoClientId": "", "pathaoPassword": "", "pathaoUsername": "", "pathaoClientSecret": ""}	{"apiKey": "", "secretKey": ""}	{"links": [{"href": "/", "label": "Home", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Shop", "order": 1, "isActive": true, "isOpenInNewTab": false}], "layout": "default", "sticky": true, "maxWidth": "standard", "template": "classic", "textColor": "", "bottomShape": "none", "hoverEffect": "underline", "transparent": false, "borderRadius": "xl", "showCurrency": true, "backgroundColor": "", "shadowIntensity": "subtle", "backgroundPattern": "none"}	[]	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:11:18.695182+00	2026-03-22 03:29:15.531395+00	\N	{"columns": "4", "sections": [{"links": [{"href": "/products", "label": "All Products", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products?sort=newest", "label": "Hot Releases", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Flash Sales", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 0, "title": "Shop Categories"}, {"links": [{"href": "/profile", "label": "Track Order", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Help Center", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/privacy", "label": "Return Policy", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 1, "title": "Support"}], "template": "modern", "topShape": "none", "copyright": "© 2026 nice. Made with Heart by Gowtam Kumar.", "textColor": "#f8fafc", "brandColor": "", "borderColor": "", "description": "Elevating your daily experience with premium sound and state-of-the-art design.", "glassEffect": false, "borderRadius": "none", "showNewsletter": true, "backgroundColor": "#0f172a", "shadowIntensity": "none", "showSocialLinks": true, "backgroundPattern": "none"}	{"bannerShow": true, "showBrands": true, "showSearch": true, "bannerStyle": "modern", "sidebarStyle": "modern", "bannerTagline": "", "bannerHeadline": "", "productsPerRow": 4, "showCategories": true, "showPriceFilter": true, "bannerSubheadline": ""}	{"showShare": true, "showStock": true, "showRating": true, "showFeatures": true, "showBreadcrumb": true, "showPromotions": true, "showStickyCart": true, "showProductFAQs": true, "showProductReviews": true, "showRelatedProducts": true, "relatedProductsPerRow": 4}	{"bannerShow": true, "showFilters": true, "bannerHeadline": "", "productsPerRow": 5, "bannerSubheadline": ""}	{"insideCityFee": 60, "outsideCityFee": 120, "freeShippingThreshold": 5000}	\N
0351163b-695f-4ba3-8bfa-60596acd01cf	http://localhost:3900/uploads/1772469298708_67c984ccbb2cd000519aa06a.webp	gowtam KUmar	Welcome to gowtam! Premium products and excellent service.	gowtam@gmail.com	+8801767163576	+8801767163576	Jhikaracha,Jashore	BDT	৳	[{"code": "BDT", "name": "BDT", "rate": 1, "symbol": "৳"}, {"code": "USD", "name": "USD", "rate": 120, "symbol": "$"}]	{"twitter": "https://www.linkedin.com/feed/", "facebook": "https://www.linkedin.com/feed/", "linkedin": "https://www.linkedin.com/feed/", "instagram": "https://www.linkedin.com/feed/"}	{"facebookPixelId": "", "googleAnalyticsId": "", "googleSiteVerification": "", "facebookDomainVerification": ""}	{"from": "gowtampaul0@gmail.com", "host": "smtp.gmail.com", "pass": "wqym jewt wlkx gppe", "port": 465, "user": "gowtampaul0@gmail.com", "secure": false}	{"stripeSecretKey": "", "sslCommerzStoreId": "", "sslCommerzIsSandbox": false, "stripePublishableKey": "", "sslCommerzStorePassword": ""}	{"sandboxMode": false, "pathaoStoreId": "", "pathaoClientId": "", "pathaoPassword": "", "pathaoUsername": "", "pathaoClientSecret": ""}	{"apiKey": "", "secretKey": ""}	{"links": [{"href": "/", "label": "Home", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Shop", "order": 1, "isActive": true, "isOpenInNewTab": false}], "layout": "default", "sticky": true, "maxWidth": "standard", "template": "glass", "textColor": "", "bottomShape": "none", "hoverEffect": "background", "transparent": false, "borderRadius": "none", "showCurrency": false, "backgroundColor": "#f5f5f5", "shadowIntensity": "none", "backgroundPattern": "none"}	[{"icon": "Truck", "title": "free Return", "description": "On all order $50"}]	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:54:11.672721+00	2026-03-22 10:00:40.155067+00	\N	{"columns": "4", "sections": [{"links": [{"href": "/products", "label": "All Products", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products?sort=newest", "label": "Hot Releases", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Flash Sales", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 0, "title": "Shop Categories"}, {"links": [{"href": "/profile", "label": "Track Order", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Help Center", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/privacy", "label": "Return Policy", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 1, "title": "Support"}, {"links": [{"href": "/", "label": "test-1", "order": 0, "isActive": true, "isOpenInNewTab": false}], "order": 2, "title": "new section"}], "template": "modern", "topShape": "none", "copyright": "© 2026 gowtam. Made with Heart by Gowtam Kumar.", "textColor": "#f8fafc", "brandColor": "", "borderColor": "", "description": "Elevating your daily experience with premium sound and state-of-the-art design.", "glassEffect": false, "borderRadius": "none", "showNewsletter": true, "backgroundColor": "#0f172a", "shadowIntensity": "none", "showSocialLinks": true, "backgroundPattern": "none"}	{"bannerShow": true, "showBrands": true, "showSearch": true, "bannerImage": "http://localhost:3900/uploads/1772471380322_imported-chinese-embroidery-beaded-beige-kids-shoe_1_Vo8cO85JjiY.jpg", "bannerStyle": "image", "sidebarStyle": "modern", "bannerHeadline": "", "productsPerRow": 4, "showCategories": true, "bannerFullWidth": false, "bannerTextColor": "#ed3d02", "showPriceFilter": true, "bannerSubheadline": "", "bannerOverlayOpacity": 100, "bannerBackgroundColor": "#4994df"}	{"showShare": true, "showStock": true, "showRating": true, "showFeatures": true, "showBreadcrumb": true, "showPromotions": true, "showStickyCart": true, "showProductFAQs": true, "showProductReviews": true, "showRelatedProducts": true, "relatedProductsPerRow": 4}	{"bannerShow": true, "showFilters": true, "bannerHeight": 300, "bannerHeadline": "Banner Heading", "productsPerRow": 4, "bannerFullWidth": false, "bannerSubheadline": "sadfasdfasdf"}	{"insideCityFee": 60, "outsideCityFee": 120, "freeShippingThreshold": 5000}	\N
\.


--
-- Data for Name: staff_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_invitations (id, created_at, updated_at, email, role, tenant_id, token, status, expires_at, invited_by) FROM stdin;
dd4955ad-8e72-49c6-8581-657a8cb59d8d	2026-03-17 16:16:04.391503+00	2026-03-17 16:16:26.698903+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	bb2fe6cba510ea03be5340279d1ec983b78bf4097471f20aa2eeaf9c19f5dadc	expired	2026-03-19 16:16:04.388+00	e8083ac4-0762-487a-b5fb-40e38599a435
b95fc84e-e55b-4cf3-812c-9dbfb5dfcdc5	2026-03-17 16:16:37.997007+00	2026-03-17 16:25:56.507247+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	065e60383e6feb481b225d69a195dd4e00465a2736dbf58c8775fbbf5c85accb	expired	2026-03-19 16:16:37.996+00	e8083ac4-0762-487a-b5fb-40e38599a435
ed542656-cb7c-454a-ba78-00c099291b97	2026-03-17 16:26:08.547263+00	2026-03-17 16:27:07.635519+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	be46a413f40b958dae777915452f30fd337b4a3a111447426f6d36d745560be9	expired	2026-03-19 16:26:08.546+00	e8083ac4-0762-487a-b5fb-40e38599a435
dbd60c93-5bf6-4a37-8a59-4bb965d25ee7	2026-03-17 16:27:11.763936+00	2026-03-17 16:34:51.922112+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	9b67be7c6fc375d4ec24da38537718649078a4d84b920ea4dcf7f6a91ba03e72	expired	2026-03-19 16:27:11.763+00	e8083ac4-0762-487a-b5fb-40e38599a435
2939795f-18ef-4e67-be52-ed91c732f6dd	2026-03-17 16:40:22.571796+00	2026-03-17 16:48:09.921445+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	4fb5dbe2e596eef586bbc207023d9fa7732889bf7fd90dd78e81810dc44221ee	expired	2026-03-19 16:40:22.57+00	e8083ac4-0762-487a-b5fb-40e38599a435
e5e9a7f0-4200-41c4-94d7-dba6eff671ab	2026-03-17 16:48:28.946738+00	2026-03-17 16:49:17.19328+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	e9a1f5061efb75d148b38733b7e617e0bbb834f610ee50298d768a65beea03a9	expired	2026-03-19 16:48:28.946+00	e8083ac4-0762-487a-b5fb-40e38599a435
721294d5-d348-4b70-9732-72c61f001278	2026-03-19 15:21:38.869071+00	2026-03-19 15:22:36.656677+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	354767f9aa603ed13dafccbab83e328dc352826dcee76a4b16a1164b81f69071	expired	2026-03-21 15:21:38.868+00	e8083ac4-0762-487a-b5fb-40e38599a435
1680f831-3f3d-4c7a-a206-bedac04be270	2026-03-19 16:00:16.934868+00	2026-03-19 16:12:22.374419+00	gowtamkumar2019@gmail.com	Operator	e70063fd-c5b4-458b-a139-6130f2515580	a24af3e74b2c8eaabf958f2e1989d6844d9466fea0d7fadb79eb78595b836011	accepted	2026-03-21 16:00:16.934+00	e8083ac4-0762-487a-b5fb-40e38599a435
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
046f18dd-b985-4084-a591-2b686e3074ab	2026-03-16 12:32:00.091136+00	2026-03-16 12:32:00.091136+00	bb094c4b-6fb5-40c9-bac7-ca47d349c3b4	2f62a619-47d3-453c-a040-994509e8d923	1769764.00	2026-03-16 12:32:00.096	Cash	eee	eee	e70063fd-c5b4-458b-a139-6130f2515580	\N
04bd8519-4268-45cb-8b4e-02400fa7887a	2026-03-19 15:47:34.849538+00	2026-03-19 15:47:34.849538+00	e57e5892-31ff-4016-8a89-1f05d6fc6309	2f62a619-47d3-453c-a040-994509e8d923	10000.00	2026-03-19 15:47:34.856	Cash			e70063fd-c5b4-458b-a139-6130f2515580	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, created_at, updated_at, name, contact_name, email, phone, address, tenant_id, user_id) FROM stdin;
2f62a619-47d3-453c-a040-994509e8d923	2026-03-04 17:42:45.402899+00	2026-03-04 17:42:45.402899+00	Gowtam	Gowtam	gowtampaul0@gmail.com	+8801767163576	Jhikaracha,Jashore	e70063fd-c5b4-458b-a139-6130f2515580	\N
d0215f61-39f2-4030-8216-6a300eefb8ac	2026-03-21 05:18:45.519625+00	2026-03-21 05:18:45.519625+00	acme	New supplier	gowtampaul0@gmail.com	01767163576	aaaaaaaaaaa	d918424e-f653-4068-bb6e-caec287bc2ad	\N
\.


--
-- Data for Name: tenant_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_traffic (id, created_at, updated_at, tenant_id, date, request_count, last_updated, user_id) FROM stdin;
f1745e67-874e-40fc-a204-f6f42b0c855f	2026-03-06 02:45:25.596488+00	2026-03-06 02:45:25.596488+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-06	1872	2026-03-06 15:05:53.302287+00	\N
8169ceeb-f664-4d40-918f-8ff03cbfbfd0	2026-03-07 14:15:28.693446+00	2026-03-07 14:15:28.693446+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-07	2494	2026-03-07 18:25:52.536822+00	\N
4a84bd7a-7a52-469c-b65c-a79743fb59dc	2026-03-25 16:08:46.184093+00	2026-03-25 16:08:46.184093+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-25	48	2026-03-25 16:36:39.84781+00	\N
29a99409-df4e-4ff4-be20-4b00362f45d9	2026-03-02 16:32:17.20637+00	2026-03-02 16:32:17.20637+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-02	560	2026-03-02 17:31:21.286927+00	\N
9ec4c2a3-a0fb-4a28-8acc-0c560ec173cc	2026-03-01 11:06:28.160815+00	2026-03-01 11:06:28.160815+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	2026-03-01	397	2026-03-01 12:58:36.757311+00	\N
241d8ed3-bf41-46d4-9cdc-7216fd24f152	2026-03-21 05:11:22.080522+00	2026-03-21 05:11:22.080522+00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21	2066	2026-03-21 13:02:42.694384+00	\N
e449f599-ad32-4aea-9993-c6fefe93fde3	2026-03-11 14:00:03.895594+00	2026-03-11 14:00:03.895594+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-11	973	2026-03-11 16:48:08.127736+00	\N
838f9c00-726f-4706-a2fe-679700e88585	2026-02-27 06:10:13.468822+00	2026-02-27 06:10:13.468822+00	9ca9a44d-a493-4fe7-b829-ca929cdc2e71	2026-02-27	52	2026-02-27 16:12:24.204174+00	\N
a53caed7-9840-49c6-a0ca-35aab5432ca0	2026-03-17 15:59:11.161194+00	2026-03-17 15:59:11.161194+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-17	307	2026-03-17 17:31:56.061207+00	\N
5af7f451-5c1f-461e-b4e5-4b134286bff8	2026-03-14 13:06:32.889238+00	2026-03-14 13:06:32.889238+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-14	2068	2026-03-14 18:21:03.960844+00	\N
64b35d7f-28d3-4e02-b32d-0d5c4727db8a	2026-03-08 13:15:35.843319+00	2026-03-08 13:15:35.843319+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-08	2378	2026-03-08 18:40:55.275898+00	\N
d159a097-7cf7-4e21-8d2c-720b36dd2ff9	2026-03-04 12:42:45.63963+00	2026-03-04 12:42:45.63963+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-04	1365	2026-03-04 19:05:48.144813+00	\N
5a54dacc-cde9-4b51-a62a-523281936918	2026-03-16 10:08:59.245127+00	2026-03-16 10:08:59.245127+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-16	2613	2026-03-16 15:31:34.278178+00	\N
325d0c61-02e3-4266-aabb-f5e6f60fcf11	2026-03-22 03:47:36.575959+00	2026-03-22 03:47:36.575959+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-22	846	2026-03-22 11:48:05.837172+00	\N
7a827eee-959b-4fa4-bafe-4f6194c462e4	2026-03-05 15:38:06.797105+00	2026-03-05 15:38:06.797105+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-05	754	2026-03-05 18:03:37.975402+00	\N
12e7a16a-592b-4a26-8197-43e520c1f685	2026-03-02 16:37:27.938166+00	2026-03-02 16:37:27.938166+00	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02	61	2026-03-02 17:07:17.664874+00	\N
bab8a408-79c7-440e-9425-6a2058fc617c	2026-03-22 02:14:54.948214+00	2026-03-22 02:14:54.948214+00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22	364	2026-03-22 04:02:33.602712+00	\N
0ffd5e93-a87f-49c0-a9b0-847966872267	2026-02-27 04:53:08.591559+00	2026-02-27 04:53:08.591559+00	6935cf98-aa91-42ea-9aa8-487a8b20c65e	2026-02-27	23	2026-02-27 06:10:12.213677+00	\N
2048e280-ff86-417c-8106-e59c8516aeb2	2026-03-13 02:09:19.677938+00	2026-03-13 02:09:19.677938+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-13	2229	2026-03-13 09:50:44.388502+00	\N
6b8b2c9d-75a7-4ddd-9a96-5167d7a9c092	2026-03-12 12:53:32.141581+00	2026-03-12 12:53:32.141581+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-12	1491	2026-03-12 17:44:08.679414+00	\N
954b356f-cc7b-45d5-8974-80c81a371444	2026-03-01 12:54:28.803337+00	2026-03-01 12:54:28.803337+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01	119	2026-03-01 13:03:31.136473+00	\N
51d409d1-ef14-4090-bc54-c9052ea8b6d6	2026-03-19 07:50:51.15788+00	2026-03-19 07:50:51.15788+00	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19	1279	2026-03-19 17:20:34.180262+00	\N
09acd5bc-0b79-4684-85f0-c858853e241f	2026-03-19 15:25:06.890828+00	2026-03-19 15:25:06.890828+00	37aee4da-502c-481c-87c7-5996d2e52a8a	2026-03-19	12	2026-03-19 15:25:19.094671+00	\N
4dc08a14-f892-49b7-ada8-6240d31bca0c	2026-03-25 16:36:54.242465+00	2026-03-25 16:36:54.242465+00	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-25	47	2026-03-25 16:40:44.591994+00	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, store_name, subdomain, custom_domain, custom_domain_status, custom_domain_verified_at, status, ssl_enabled, created_at, updated_at, subscription_plan_id, subscription_billing_cycle, subscription_status, subscription_starts_at, subscription_ends_at, user_id) FROM stdin;
e70063fd-c5b4-458b-a139-6130f2515580	gowtam	gowtam	\N	pending	\N	active	f	2026-03-01 12:54:11.602799+00	2026-03-01 12:54:11.602799+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-01 12:54:11.599+00	2026-04-01 12:54:11.599+00	\N
e46772b2-c511-4409-a267-55d282f1c0ef	poly	poly	\N	pending	\N	active	f	2026-03-02 16:37:25.868263+00	2026-03-02 16:37:25.868263+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-02 16:37:25.867+00	2026-04-02 16:37:25.867+00	\N
37aee4da-502c-481c-87c7-5996d2e52a8a	arko	arko	\N	pending	\N	active	f	2026-03-19 15:25:04.990662+00	2026-03-19 15:25:04.990662+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-19 15:25:04.99+00	2026-04-19 15:25:04.99+00	\N
d918424e-f653-4068-bb6e-caec287bc2ad	nice	nice	\N	pending	\N	active	f	2026-03-21 05:11:18.624678+00	2026-03-21 05:11:18.624678+00	49d2a11a-bf12-4cb4-a136-1ac8ac3addec	MONTHLY	ACTIVE	2026-03-21 05:11:18.621+00	2026-04-21 05:11:18.621+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, username, password, phone, address, image, is_admin, is_email_verified, email_verification_token, reset_password_token, reset_password_expires, role, status, refresh_token, tenant_id, created_at, updated_at) FROM stdin;
deb0d291-6e8c-4df5-970a-216d3cd5a823	poly paul	poly@gmail.com	poly	$2b$10$RtSoRuEMg1o8cuEscMOV2uexgvI9ZPH4iS9h8C92z1OweFzSVUhtm	\N	\N	\N	f	f	e9a5ee25251afda2370f81e78061eafe81c6ed6064d00c8dab5e9b7e1ed634ed	\N	\N	Admin	Active	$2b$10$GX6DZwAd94IIEgyJTMebPekpZCyoR5un7AFohp2jIYzTlQlssmnZO	e46772b2-c511-4409-a267-55d282f1c0ef	2026-03-02 16:37:25.920294+00	2026-03-02 16:56:48.661062+00
cbe41466-0d58-47a8-bd66-8dbc0ff360cc	Arkopual	Arkopual@gmail.com	Arkopual258	$2b$10$c1zS29f2wI7EqCN9jy0eEetPbhPnKaHGkdbtSVsiohxkWUpOMXtu2	\N	\N	\N	f	f	aa9cc3bf0969f231e5b4122cf2f7e6310a913435da14936ef499e4e1c5b70334	\N	\N	User	Active	$2b$10$mngNnpLT8.tl27p6s6.LEuXtlOo5Rz89BdB6R.VSXCFuRENkuND0O	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 13:01:20.636086+00	2026-03-01 13:01:20.828197+00
065ad69a-eb43-45ae-aa52-a65126068816	arko paul	arkopaul@gmail.com	arkopaul	$2b$10$UHFUQ.vbix.sZR1WBhqy0ehHsg99QlISFGxOA8650ziiAKy/JimrG	\N	\N	\N	f	f	4407fc2cf058146013161f0febb46b87340eee223266694a94f32c3da6a5a239	\N	\N	Admin	Active	$2b$10$s7YZWBC2g6xM9oyK2NXpzOfzGHXrelyRZqXKJVfd8B61bJYkRxnv2	37aee4da-502c-481c-87c7-5996d2e52a8a	2026-03-19 15:25:05.045588+00	2026-03-19 17:21:10.638883+00
a132759e-4e63-454a-990c-58bb3aa34a2b	nice	nice@gmail.com	nice	$2b$10$78GNi27SsmUN1zGtQ8SM5OQe0.ySEkJzo0WNNEAH4pNbEMZdwWaWu	\N	\N	\N	f	f	4f253eb23ac5320ff27698e99ff747ef86c48da50862e88f5d91c3eeba20ee4f	\N	\N	Admin	Active	$2b$10$9.9o2I4UgJ2UQUme0AdlqOcisz1H8nFb9fakPK10aIS43qSwMzJ.y	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-21 05:11:18.677349+00	2026-03-25 16:40:20.072246+00
dd5d24b0-2970-4207-a90d-5c1517890e45	gowtamkumar	admin@gmail.com	admind	$2b$10$ohbHtugVCvvb5PQQW3lFiOvl1/wVGTZDT82BVaBKXRv8sI8gZ/nVS	\N	\N	\N	t	f	efa7d8b7b65a8d3817d9c87e79b95b7338a9131ee5448d09bd0fc6713878da2b	\N	\N	SuperAdmin	Active	$2b$10$n2A9i2cXdbT10KSXEf3xhOXcGTGbji/JkZ9jmF4THfAmpgOaqxJVW	\N	2026-02-25 15:16:18.097149+00	2026-03-25 15:58:01.892634+00
e8083ac4-0762-487a-b5fb-40e38599a435	Gowtam Kumar	gowtampaul0@gmail.com	gowtam	$2b$10$b0U7tcZdvO7g68XQt0N78.ypp0lf8997iUDPEwS4O6e6BiGgGDj.i	01767163576	Jhikaracha,Jashore	http://localhost:3900/uploads/1772472477028_gowtam.jpg	f	f	90dad9e41963f91a5ffc426b0a20eb34f9debff2abb940f0f2d175620a2f3660	\N	\N	Admin	Active	$2b$10$HOWaGNgydllX4qzBi/rpheJkEGrFPCITq1rt2S6HKQVnqcbsxRkIK	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-01 12:54:11.655429+00	2026-03-25 15:58:31.99144+00
65328c8d-db41-47e4-aa21-4c657bdf4f02	test-name	gowtamkumar2019@gmail.com	test-name	$2b$10$aeEhOeIJ1QvtRgAxCq1tw.pYqVQfq55FeoX/4iy.sWHFf1XmpDh3q	\N	\N	\N	f	f	\N	\N	\N	Operator	Active	$2b$10$ekoL5WgaTULAlxOr3wXc1u./Nm7zragxlqbfO.s38krtEKVTixLVO	e70063fd-c5b4-458b-a139-6130f2515580	2026-03-19 16:12:22.363412+00	2026-03-25 16:33:10.860301+00
21f16dec-bcd5-4d94-b257-7c925c1f2cca	Gowtam Kumar	gowtampaul0@gmail.com	gowtampaul0367	$2b$10$F.0ECTZtu3Lnk6WYlbnfLugVpnAHzn8pf4J4UEgF1EwxEf9JxLVfi	\N	\N	\N	f	f	2c4a82a9695f6de63b87f093bc8afc830cf329acc4cb354f677e0ac036153aae	\N	\N	User	Active	$2b$10$1KqFeqJVTr9y.NHrsQZ0J.p/Essyy9.GnpynaCJlD9kGZ391iiztK	d918424e-f653-4068-bb6e-caec287bc2ad	2026-03-22 04:02:33.084894+00	2026-03-25 16:36:55.222803+00
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
-- Name: staff_invitations UQ_4e6e40d4c9c24f41c1067b55140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_invitations
    ADD CONSTRAINT "UQ_4e6e40d4c9c24f41c1067b55140" UNIQUE (token);


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
-- Name: promotions UQ_dbea049b681d15564f46dd7bdee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "UQ_dbea049b681d15564f46dd7bdee" UNIQUE (slug);


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

\unrestrict qYu2oFnIQe8MaTzICxRG275Fgw8WlvUdmSNRTvhulzuzUWPDX2wGiVkGorew9nz

