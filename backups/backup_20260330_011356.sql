--
-- PostgreSQL database dump
--

\restrict 0bUNnztUJFkweFzv5GXekTPLyjzRKq3QOTkoOeAmrjhwVKGWuZApRYr07v1hvPE

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
-- Name: tenant_subscription_plans_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tenant_subscription_plans_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'completed'
);


ALTER TYPE public.tenant_subscription_plans_status_enum OWNER TO postgres;

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
    'active',
    'past_due',
    'canceled',
    'expired'
);


ALTER TYPE public.tenants_subscription_status_enum OWNER TO postgres;

--
-- Name: user_subscription_plans_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_subscription_plans_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'completed'
);


ALTER TYPE public.user_subscription_plans_status_enum OWNER TO postgres;

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
    description text,
    tenant_id uuid NOT NULL,
    user_id uuid,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    image character varying,
    website character varying
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    is_sale boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL
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
    invoice_number character varying(100) NOT NULL,
    tenant_id uuid NOT NULL,
    subscription_plan_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    status public.subscription_invoices_status_enum DEFAULT 'pending'::public.subscription_invoices_status_enum NOT NULL,
    transaction_id character varying,
    billing_date timestamp with time zone DEFAULT now() NOT NULL,
    payment_url text,
    gateway_response jsonb
);


ALTER TABLE public.subscription_invoices OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    user_id uuid,
    billing_cycle public.subscription_plans_billing_cycle_enum DEFAULT 'monthly'::public.subscription_plans_billing_cycle_enum NOT NULL
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, created_at, updated_at, tenant_id, user_id, action, entity, entity_id, old_value, new_value, ip_address, user_agent) FROM stdin;
c9f0d9c9-bfe0-4953-9b22-939b76c011c1	2026-03-29 12:44:57.674907+00	2026-03-29 12:44:57.674907+00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	e6a84035-65fe-446a-8552-574f452bd626	CREATE	Brand	\N	\N	{"name": "Nike brad", "slug": "nike-brad", "image": "", "website": "https://www.nike.com/", "description": ""}	::ffff:172.18.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, created_at, updated_at, description, tenant_id, user_id, name, slug, image, website) FROM stdin;
43e0b9ab-473c-450c-9cb5-c7bca1373012	2026-03-29 12:44:57.666764+00	2026-03-29 12:44:57.666764+00		8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	Nike brad	nike-brad		https://www.nike.com/
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, created_at, updated_at, cart_id, product_id, variant_id, quantity, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, created_at, updated_at, user_id, tenant_id, applied_coupon_code) FROM stdin;
f90d2b91-ac75-4653-ac00-439781912297	2026-03-28 15:19:50.528617+00	2026-03-28 15:19:50.528617+00	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, created_at, updated_at, name, slug, description, image, tenant_id, user_id) FROM stdin;
24aa9d0d-c2a2-4e8a-bf6c-33dc6a02b315	2026-03-29 12:44:31.124102+00	2026-03-29 12:44:31.124102+00	Nike	nike			8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, created_at, updated_at, code, description, "discountType", amount, min_purchase_amount, start_date, expiry_date, usage_limit, used_count, is_active, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, created_at, updated_at, title, description, amount, expense_date, category, reference_number, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, created_at, updated_at, question, answer, category, "order", status, tenant_id, product_id, page_id, user_id) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, created_at, updated_at, fieldname, originalname, encoding, mimetype, destination, filename, pdf_file, path, size, tenant_id, user_id) FROM stdin;
0b7cfed4-c363-4f50-b353-af7ec3b0f5b0	2026-03-29 12:49:01.541833+00	2026-03-29 12:49:01.541833+00	file	63e1a453b53d5907ab06adb3aeeba854.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp	\N	public/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp	16686	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
ed41ff5c-3f4c-4e9d-a88d-3283d23d3426	2026-03-29 12:49:07.468147+00	2026-03-29 12:49:07.468147+00	file	96ee562e41468f26213d162c82cad2c4.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1774788547466_96ee562e41468f26213d162c82cad2c4.webp	\N	public/uploads/1774788547466_96ee562e41468f26213d162c82cad2c4.webp	41176	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
5f1c4534-b27e-4cff-8236-2a915eebb4c3	2026-03-29 12:49:10.722829+00	2026-03-29 12:49:10.722829+00	file	9e04ea553b896e80bc884f5cdeffe160.jpg_720x720q80.jpg_.webp	7bit	image/webp	public/uploads	1774788550721_9e04ea553b896e80bc884f5cdeffe160.webp	\N	public/uploads/1774788550721_9e04ea553b896e80bc884f5cdeffe160.webp	28916	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
0d4bdf73-0ad3-45aa-b141-77a5deefc3ca	2026-03-29 12:49:14.426473+00	2026-03-29 12:49:14.426473+00	file	ad10c6b0d18c4d008d7cb43e55df763a.jpg_2200x2200q80.jpg_.webp	7bit	image/webp	public/uploads	1774788554424_ad10c6b0d18c4d008d7cb43e55df763a.webp	\N	public/uploads/1774788554424_ad10c6b0d18c4d008d7cb43e55df763a.webp	46548	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, created_at, updated_at, product_id, variant_id, supplier_id, type, quantity, reference_type, reference_id, tenant_id, user_id) FROM stdin;
44692457-412a-418c-8df0-319052c3c5b0	2026-03-29 12:53:30.237463+00	2026-03-29 12:53:30.237463+00	d0b57858-301f-4a9a-bb30-6f0405cc8615	297ba8c2-73cd-47b5-a352-4f4293d84b47	b5b35686-d31e-429f-9e98-29b248492038	in	100	purchase	55d12e7e-d343-47a3-9e2b-eb96faf442cd	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
7db9fb5e-d1f6-4894-ba1d-e62b18d57a81	2026-03-29 12:53:30.24985+00	2026-03-29 12:53:30.24985+00	d0b57858-301f-4a9a-bb30-6f0405cc8615	e437ab04-9cb5-452a-8cc2-a1d24becf5b7	b5b35686-d31e-429f-9e98-29b248492038	in	100	purchase	55d12e7e-d343-47a3-9e2b-eb96faf442cd	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
3cb70bfb-2f98-4ce3-9912-4b32a86266f1	2026-03-29 12:53:30.259412+00	2026-03-29 12:53:30.259412+00	d0b57858-301f-4a9a-bb30-6f0405cc8615	64af6785-7188-414c-8d34-7caf64fd0709	b5b35686-d31e-429f-9e98-29b248492038	in	100	purchase	55d12e7e-d343-47a3-9e2b-eb96faf442cd	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
203c3419-02ee-4e6f-910e-abada1d183a2	2026-03-29 12:55:46.955271+00	2026-03-29 12:55:46.955271+00	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	b5b35686-d31e-429f-9e98-29b248492038	in	100	purchase	2c8fcde4-e87f-40a4-8c4a-db2248047ec0	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
67b186db-e10b-4f69-9fd2-c30c10ab09ce	2026-03-29 15:15:11.172574+00	2026-03-29 15:15:11.172574+00	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	\N	out	1	order	\N	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
a8b95cba-e2de-4730-9b67-6dcf6795141b	2026-03-29 15:17:40.359843+00	2026-03-29 15:17:40.359843+00	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	\N	out	1	order	\N	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
d5d71ba0-bbaa-4d8e-8e1e-60bc00de6545	2026-03-29 15:18:34.148356+00	2026-03-29 15:18:34.148356+00	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	\N	out	1	order	\N	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
1f67001e-5314-48bb-a939-02ad92ac40c1	2026-03-29 15:22:43.938697+00	2026-03-29 15:22:43.938697+00	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	\N	out	1	order	\N	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, created_at, updated_at, invoice_number, order_id, issue_date, due_date, status, tenant_id, user_id) FROM stdin;
33022734-3149-4ef4-a48f-a2d007100cca	2026-03-29 15:15:11.172574+00	2026-03-29 15:15:11.172574+00	INV-202603-9591	d28f87f1-0c65-40ec-972b-cb2acac3ee74	2026-03-29	\N	pending	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	e6a84035-65fe-446a-8552-574f452bd626
bf655540-0773-4013-a4d4-eb5b006c80be	2026-03-29 15:17:40.359843+00	2026-03-29 15:17:40.359843+00	INV-202603-9486	0e6fa9de-5385-42a5-a4ea-185469d0cc28	2026-03-29	\N	pending	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	e6a84035-65fe-446a-8552-574f452bd626
78fbd4af-08ff-473a-a796-a0e3b086aa79	2026-03-29 15:18:34.148356+00	2026-03-29 15:18:34.148356+00	INV-202603-6008	0302f391-84f3-49e1-adc5-fcb9b724a83c	2026-03-29	\N	pending	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	e6a84035-65fe-446a-8552-574f452bd626
c0d00644-e61f-4fde-9e61-0328f6653167	2026-03-29 15:22:43.938697+00	2026-03-29 15:22:43.938697+00	INV-202603-4187	08a61f95-6938-468b-867e-d5ea0a77a50c	2026-03-29	\N	pending	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	e6a84035-65fe-446a-8552-574f452bd626
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, created_at, updated_at, name, email, phone, address, subject, message, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, created_at, updated_at, order_id, product_id, variant_id, snapshot, quantity, unit_price, discount_amount, tax_amount, total_amount, tenant_id, user_id) FROM stdin;
fa6f40af-1279-40fe-a62f-908e4e86729e	2026-03-29 15:15:11.172574+00	2026-03-29 15:15:11.172574+00	d28f87f1-0c65-40ec-972b-cb2acac3ee74	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	{"price": 1020, "productId": "c95df14e-6d7c-42ab-a7c4-fe3fb2b63266", "productName": "ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC", "productImage": "http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp"}	1	1020.00	102.00	91.80	1009.80	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
40e9ccfe-1d2f-4372-9525-fdc6ca5af0f4	2026-03-29 15:17:40.359843+00	2026-03-29 15:17:40.359843+00	0e6fa9de-5385-42a5-a4ea-185469d0cc28	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	{"price": 1020, "productId": "c95df14e-6d7c-42ab-a7c4-fe3fb2b63266", "productName": "ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC", "productImage": "http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp"}	1	1020.00	102.00	91.80	1009.80	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
d0b6864a-0790-483e-ac65-7e461687b773	2026-03-29 15:18:34.148356+00	2026-03-29 15:18:34.148356+00	0302f391-84f3-49e1-adc5-fcb9b724a83c	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	{"price": 1020, "productId": "c95df14e-6d7c-42ab-a7c4-fe3fb2b63266", "productName": "ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC", "productImage": "http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp"}	1	1020.00	102.00	91.80	1009.80	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
fb52b5e9-a752-4049-b253-d8325254e209	2026-03-29 15:22:43.938697+00	2026-03-29 15:22:43.938697+00	08a61f95-6938-468b-867e-d5ea0a77a50c	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	{"price": 1020, "productId": "c95df14e-6d7c-42ab-a7c4-fe3fb2b63266", "productName": "ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC", "productImage": "http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp"}	1	1020.00	102.00	91.80	1009.80	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: order_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_returns (id, created_at, updated_at, order_id, user_id, status, reason, admin_comment, refund_amount, items, tenant_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, created_at, updated_at, customer_name, customer_email, customer_phone, address, shipping_address_id, total_amount, shipping_fee, currency, currency_rate, status, payment_method, payment_status, transaction_id, order_notes, user_id, tenant_id, tracking_id, courier_status, applied_coupon, coupon_discount_amount, tax_amount, delivery_zone) FROM stdin;
d28f87f1-0c65-40ec-972b-cb2acac3ee74	2026-03-29 15:15:11.172574+00	2026-03-29 15:15:11.172574+00	Poly paul	gowtam@gmail.com	01767163576	Poly paul, Jashore,jhikargacha, Jashore	f7a270d4-2cbe-4f90-b933-2530cd2817b9	978.00	60.00	USD	1.0000	pending	cod	pending	\N		e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	0.00	91.80	inside
0e6fa9de-5385-42a5-a4ea-185469d0cc28	2026-03-29 15:17:40.359843+00	2026-03-29 15:17:40.359843+00	Poly paul	gowtam@gmail.com	01767163576	Poly paul, Jashore,jhikargacha, Jashore	f7a270d4-2cbe-4f90-b933-2530cd2817b9	978.00	60.00	USD	1.0000	pending	cod	pending	\N	sdfasdf	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	0.00	91.80	inside
0302f391-84f3-49e1-adc5-fcb9b724a83c	2026-03-29 15:18:34.148356+00	2026-03-29 15:18:34.148356+00	Poly paul	gowtam@gmail.com	01767163576	Poly paul, Jashore,jhikargacha, Jashore	f7a270d4-2cbe-4f90-b933-2530cd2817b9	978.00	60.00	USD	1.0000	pending	cod	pending	\N	asdf	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	0.00	91.80	inside
08a61f95-6938-468b-867e-d5ea0a77a50c	2026-03-29 15:22:43.938697+00	2026-03-29 15:22:43.938697+00	Poly paul	gowtam@gmail.com	01767163576	Poly paul, Jashore,jhikargacha, Jashore	f7a270d4-2cbe-4f90-b933-2530cd2817b9	978.00	60.00	USD	1.0000	pending	cod	pending	\N	asdf	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	0.00	91.80	inside
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, created_at, updated_at, title, slug, is_home_page, "order", sections, meta_title, meta_description, og_image, typography, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, created_at, updated_at, order_id, user_id, transaction_id, amount, currency, method, status, gateway_response, tenant_id) FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, created_at, updated_at, brand_name, brand_logo, support_email, hero, features, footer, user_id) FROM stdin;
921732d4-c70b-4f6e-bc07-c571be263327	2026-03-27 09:08:17.519258+00	2026-03-27 09:08:17.519258+00	YourSaaS		support@yoursaas.com	{"badge": "Next-Gen eCommerce Platform", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", "title": "Launch Your Store in Seconds, Not Days", "description": "The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.", "primaryBtnLink": "/create-store", "primaryBtnText": "Start Your Free Trial", "secondaryBtnLink": "#", "secondaryBtnText": "Watch Demo"}	[{"icon": "Globe", "title": "Multi-Tenant", "description": "Run separate stores for different brands or regions with isolated data."}, {"icon": "Zap", "title": "Instant Deployment", "description": "New stores are live in seconds with their own subdomain automatically."}, {"icon": "Shield", "title": "Secure Payments", "description": "Pre-integrated with SSLCommerz and more for secure transactions."}, {"icon": "BarChart3", "title": "Global Analytics", "description": "Monitor sales and customer behavior across all your stores."}, {"icon": "Users", "title": "User Management", "description": "Role-based access control for your team and store administrators."}, {"icon": "Target", "title": "SEO Optimized", "description": "Built-in SEO tools to help your products rank higher in search results."}]	{"socials": {"twitter": "#", "facebook": "#", "linkedin": "#", "instagram": "#"}, "copyright": "© 2024 YourSaaS. All rights reserved.", "description": "The ultimate multi-tenant eCommerce platform."}	\N
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, created_at, updated_at, name, "values", product_id, tenant_id, user_id) FROM stdin;
8e58f1c6-b967-40d9-8827-61172afe7781	2026-03-29 12:53:30.189793+00	2026-03-29 12:53:30.189793+00	color	Red,Green,Yellow	d0b57858-301f-4a9a-bb30-6f0405cc8615	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, created_at, updated_at, sku, price, stock, low_stock_threshold, images, combination, product_id, tenant_id, user_id) FROM stdin;
297ba8c2-73cd-47b5-a352-4f4293d84b47	2026-03-29 12:53:30.193588+00	2026-03-29 12:53:30.235515+00	SKU-WL3QIW5MF	2098.00	100	5	http://localhost:3900/uploads/1774788550721_9e04ea553b896e80bc884f5cdeffe160.webp	{"color": "Red"}	d0b57858-301f-4a9a-bb30-6f0405cc8615	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
e437ab04-9cb5-452a-8cc2-a1d24becf5b7	2026-03-29 12:53:30.197387+00	2026-03-29 12:53:30.246469+00	SKU-CYNNK84G1	2098.00	100	5	\N	{"color": "Green"}	d0b57858-301f-4a9a-bb30-6f0405cc8615	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
64af6785-7188-414c-8d34-7caf64fd0709	2026-03-29 12:53:30.199264+00	2026-03-29 12:53:30.25778+00	SKU-13AAE39TW	2098.00	100	5	\N	{"color": "Yellow"}	d0b57858-301f-4a9a-bb30-6f0405cc8615	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, created_at, updated_at, description, short_description, price, is_review, discount_amount, discount_type, tax_rate, images, stock, low_stock_threshold, status, category_id, brand_id, landing_page_id, faq_source, faq_ids, supplier_id, tenant_id, user_id, meta_title, meta_description, og_image, is_new, is_hot, is_sale, name, slug) FROM stdin;
d0b57858-301f-4a9a-bb30-6f0405cc8615	2026-03-29 12:53:30.179817+00	2026-03-29 12:53:30.179817+00	<p>Feature Description</p><p>Audio Quality- High-fidelity sound with powerful bass</p><p>Audio Codec- SBS, AAC</p><p>Driver Size- 10mm</p><p>Noise Cancellation- Environmental Noise Cancellation (ENC)</p><p>Connectivity- Bluetooth 5.4</p><p>Compatibility- Both IOS and Android</p><p>Latency-45 ms</p><p>Play Time- 100 hrs</p><p>Standby Time- 180 hrs</p><p>Dimensions- 50.16*56.2*28.5</p><p>IPX rating- IPX5</p><p>Battery Capacity- 750mAh</p><p>Earbud Capacity- 50mAh</p><p>Design- Ergonomic design for comfortable fit</p><p>Sound Meets Style</p><ul><li><p>Introducing&nbsp;ICE PRIME PRO: The latest upgrade of our highest selling earbud. With unparalleled audio quality, crystal-clear calls, and an industry-leading 100 Hours battery life, all wrapped in a premium rubbery design.</p></li><li><p>3 EQ Mode to change style of sound- Turbo Bass, Balance Mode &amp; Treble Mode</p></li><li><p>Immerse yourself in a symphony of breathtaking sound and deep bass that transports you to another dimension of music bliss</p></li></ul><p></p>	ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC\nICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC\n	2098.00	t	10.00	percentage	10.00	http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp,http://localhost:3900/uploads/1774788554424_ad10c6b0d18c4d008d7cb43e55df763a.webp	0	3	active	24aa9d0d-c2a2-4e8a-bf6c-33dc6a02b315	43e0b9ab-473c-450c-9cb5-c7bca1373012	\N	manual		b5b35686-d31e-429f-9e98-29b248492038	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	\N	t	t	t	ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC	ice-prime-pro-tws-earbuds-100-hour-playtime-premium-enc
c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	2026-03-29 12:55:46.921697+00	2026-03-29 15:22:43.938697+00	<p>Feature Description</p><p>Audio Quality- High-fidelity sound with powerful bass</p><p>Audio Codec- SBS, AAC</p><p>Driver Size- 10mm</p><p>Noise Cancellation- Environmental Noise Cancellation (ENC)</p><p>Connectivity- Bluetooth 5.4</p><p>Compatibility- Both IOS and Android</p><p>Latency-45 ms</p><p>Play Time- 100 hrs</p><p>Standby Time- 180 hrs</p><p>Dimensions- 50.16*56.2*28.5</p><p>IPX rating- IPX5</p><p>Battery Capacity- 750mAh</p><p>Earbud Capacity- 50mAh</p><p>Design- Ergonomic design for comfortable fit</p><p>Sound Meets Style</p><ul><li><p>Introducing&nbsp;ICE PRIME PRO: The latest upgrade of our highest selling earbud. With unparalleled audio quality, crystal-clear calls, and an industry-leading 100 Hours battery life, all wrapped in a premium rubbery design.</p></li><li><p>3 EQ Mode to change style of sound- Turbo Bass, Balance Mode &amp; Treble Mode</p></li><li><p>Immerse yourself in a symphony of breathtaking sound and deep bass that transports you to another dimension of music bliss</p></li></ul><p></p>	ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC\nICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC\n	1020.00	t	10.00	percentage	10.00	http://localhost:3900/uploads/1774788541529_63e1a453b53d5907ab06adb3aeeba854.webp	96	5	active	24aa9d0d-c2a2-4e8a-bf6c-33dc6a02b315	43e0b9ab-473c-450c-9cb5-c7bca1373012	\N	manual		b5b35686-d31e-429f-9e98-29b248492038	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N	\N	\N	\N	t	t	t	ICE PRIME PRO TWS EARBUDS | 100 HOUR PLAYTIME | PREMIUM ENC	ice-prime-pro-tws-earbuds-100-hour-playtime-premium-enc2
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, created_at, updated_at, name, slug, description, "promotionType", value, "targetType", target_id, min_order_value, start_date, end_date, is_active, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, created_at, updated_at, purchase_order_id, product_id, variant_id, quantity, unit_price, user_id) FROM stdin;
06c410a2-cfff-4738-9e12-dc53347bb457	2026-03-29 12:53:30.202499+00	2026-03-29 12:53:30.202499+00	55d12e7e-d343-47a3-9e2b-eb96faf442cd	d0b57858-301f-4a9a-bb30-6f0405cc8615	297ba8c2-73cd-47b5-a352-4f4293d84b47	100	2098.00	\N
a8e162fd-85c8-4c8a-884c-bff65cd0c84e	2026-03-29 12:53:30.202499+00	2026-03-29 12:53:30.202499+00	55d12e7e-d343-47a3-9e2b-eb96faf442cd	d0b57858-301f-4a9a-bb30-6f0405cc8615	e437ab04-9cb5-452a-8cc2-a1d24becf5b7	100	2098.00	\N
64815e1b-c970-4c5d-8f1a-8a66fd7894ad	2026-03-29 12:53:30.202499+00	2026-03-29 12:53:30.202499+00	55d12e7e-d343-47a3-9e2b-eb96faf442cd	d0b57858-301f-4a9a-bb30-6f0405cc8615	64af6785-7188-414c-8d34-7caf64fd0709	100	2098.00	\N
0fc3d157-3224-43b1-ba67-76a8eaedc310	2026-03-29 12:55:46.927488+00	2026-03-29 12:55:46.941025+00	2c8fcde4-e87f-40a4-8c4a-db2248047ec0	c95df14e-6d7c-42ab-a7c4-fe3fb2b63266	\N	100	1020.00	\N
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, created_at, updated_at, reference_number, supplier_id, status, total_amount, payment_status, paid_amount, tenant_id, user_id) FROM stdin;
55d12e7e-d343-47a3-9e2b-eb96faf442cd	2026-03-29 12:53:30.202499+00	2026-03-29 12:53:30.217864+00	INITIAL_ICE-PRIME-PRO-TWS-EARBUDS-100-HOUR-PLAYTIME-PREMIUM-ENC_1774788810201	b5b35686-d31e-429f-9e98-29b248492038	received	629400.00	pending	0.00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
2c8fcde4-e87f-40a4-8c4a-db2248047ec0	2026-03-29 12:55:46.927488+00	2026-03-29 12:55:46.941025+00	INITIAL_ICE-PRIME-PRO-TWS-EARBUDS-100-HOUR-PLAYTIME-PREMIUM-ENC2_1774788946927	b5b35686-d31e-429f-9e98-29b248492038	received	102000.00	pending	0.00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, created_at, updated_at, product_id, customer_name, customer_email, rating, comment, status, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_addresses (id, created_at, updated_at, user_id, tenant_id, label, recipient_name, phone, address, city, zone, is_default) FROM stdin;
f7a270d4-2cbe-4f90-b933-2530cd2817b9	2026-03-29 14:58:56.158939+00	2026-03-29 15:28:53.625642+00	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	Home	Poly paul	01767163576	Jashore,jhikargacha	Jashore	inside	f
d5a32aed-7c8a-4437-85c1-787d1a057ea6	2026-03-29 14:58:39.187882+00	2026-03-29 14:58:56.154+00	e6a84035-65fe-446a-8552-574f452bd626	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	Home	Poly paul	01767163576	Jashore,jhikargacha	Jashore	inside	t
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, created_at, updated_at, logo, brand_name, site_description, contact_email, contact_phone, whatsapp_phone, address, currency, currency_symbol, supported_currencies, social_links, marketing, smtp, payment, pathao_courier, steadfast_courier, shipping_config, navbar, footer, trust_badges, products_page, single_product_page, offers_page, robots_txt, tenant_id, user_id) FROM stdin;
ebe43433-91cc-45f0-aa8c-83a683c6d208	2026-03-28 15:12:36.632171+00	2026-03-29 15:22:03.654132+00		gowtam	Welcome to gowtam! Premium products and excellent service.	gowtam@gmail.com				BDT	$	[]	{"twitter": "", "facebook": "", "linkedin": "", "instagram": ""}	{"facebookPixelId": "", "googleAnalyticsId": "", "googleSiteVerification": "", "facebookDomainVerification": ""}	{"from": "gowtampaul0@gmail.com", "host": "smtp.gmail.com", "pass": "wqym jewt wlkx gppe", "port": 465, "user": "gowtampaul0@gmail.com", "secure": false}	{"stripeSecretKey": "", "sslCommerzStoreId": "", "sslCommerzIsSandbox": false, "stripePublishableKey": "", "sslCommerzStorePassword": ""}	{"sandboxMode": false, "pathaoStoreId": "", "pathaoClientId": "", "pathaoPassword": "", "pathaoUsername": "", "pathaoClientSecret": ""}	{"apiKey": "", "secretKey": ""}	{"insideCityFee": 60, "outsideCityFee": 120, "freeShippingThreshold": 5000}	{"links": [{"href": "/", "label": "Home", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Shop", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Contact", "order": 2, "isActive": true, "isOpenInNewTab": false}], "layout": "default", "sticky": true, "maxWidth": "standard", "template": "classic", "textColor": "", "bottomShape": "none", "hoverEffect": "underline", "transparent": false, "borderRadius": "xl", "showCurrency": true, "backgroundColor": "", "shadowIntensity": "subtle", "backgroundPattern": "none"}	{"columns": "4", "sections": [{"links": [{"href": "/products", "label": "All Products", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/products?sort=newest", "label": "Hot Releases", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/products", "label": "Flash Sales", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 0, "title": "Shop Categories"}, {"links": [{"href": "/profile", "label": "Track Order", "order": 0, "isActive": true, "isOpenInNewTab": false}, {"href": "/contact", "label": "Help Center", "order": 1, "isActive": true, "isOpenInNewTab": false}, {"href": "/privacy", "label": "Return Policy", "order": 2, "isActive": true, "isOpenInNewTab": false}], "order": 1, "title": "Support"}], "template": "classic", "topShape": "none", "copyright": "© 2026 gowtam. Made with Heart by Gowtam Kumar.", "textColor": "", "brandColor": "", "borderColor": "", "description": "Elevating your daily experience with premium sound and state-of-the-art design.", "glassEffect": false, "borderRadius": "none", "showNewsletter": true, "backgroundColor": "", "shadowIntensity": "none", "showSocialLinks": true, "backgroundPattern": "none"}	[]	{"bannerShow": true, "showBrands": true, "showSearch": true, "bannerStyle": "modern", "sidebarStyle": "modern", "bannerTagline": "", "bannerHeadline": "", "productsPerRow": 4, "showCategories": true, "showPriceFilter": true, "bannerSubheadline": ""}	{"showShare": true, "showStock": true, "showRating": true, "showFeatures": true, "showBreadcrumb": true, "showPromotions": true, "showStickyCart": true, "showProductFAQs": true, "showProductReviews": true, "showRelatedProducts": true, "relatedProductsPerRow": 4}	{"bannerShow": true, "showFilters": true, "bannerHeadline": "", "productsPerRow": 5, "bannerSubheadline": ""}	\N	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: staff_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_invitations (id, created_at, updated_at, email, role, tenant_id, token, status, expires_at, invited_by) FROM stdin;
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, created_at, updated_at, email, is_active, user_id) FROM stdin;
\.


--
-- Data for Name: subscription_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_invoices (id, created_at, updated_at, invoice_number, tenant_id, subscription_plan_id, amount, currency, status, transaction_id, billing_date, payment_url, gateway_response) FROM stdin;
65c13ac4-8011-4534-ba23-7eb9ae7b2c0c	2026-03-28 15:22:15.609611+00	2026-03-28 15:22:15.609611+00	INV-1774711335609	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774711335609	2026-03-28 15:22:15.609+00	\N	\N
37ca12e9-b630-412c-883c-c165400fe247	2026-03-28 15:24:23.261585+00	2026-03-28 15:24:23.261585+00	INV-1774711463261	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774711463261	2026-03-28 15:24:23.261+00	\N	\N
d4bae71b-391d-4f79-a373-c8e5239f2c11	2026-03-28 15:33:37.681821+00	2026-03-28 15:33:37.681821+00	INV-1774712017678	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774712017678	2026-03-28 15:33:37.678+00	\N	\N
948c0466-cf72-4873-99cf-c94d165d4395	2026-03-28 15:34:05.13151+00	2026-03-28 15:34:05.13151+00	INV-1774712045131	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774712045131	2026-03-28 15:34:05.131+00	\N	\N
a2c71250-d5ce-4e6e-a905-2e6423cc30e6	2026-03-28 15:34:14.262255+00	2026-03-28 15:34:14.262255+00	INV-1774712054262	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774712054262	2026-03-28 15:34:14.262+00	\N	\N
4d7a6e49-a3a2-4f8e-a05c-ca2b17f48a0b	2026-03-28 15:41:41.324303+00	2026-03-28 15:41:41.324303+00	INV-1774712501324	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774712501324	2026-03-28 15:41:41.324+00	\N	\N
f75bb6de-1656-4d6e-b90b-c7d864d87280	2026-03-28 15:45:07.085519+00	2026-03-28 15:45:07.085519+00	INV-1774712707082	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774712707082	2026-03-28 15:45:07.082+00	\N	\N
9ab1f1dc-d06e-4c1c-89e7-e38121180ecb	2026-03-28 15:57:05.321488+00	2026-03-28 15:57:05.321488+00	INV-1774713425318	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774713425318	2026-03-28 15:57:05.318+00	\N	\N
dd92ce8b-1986-4b6a-8368-1e18b7310c61	2026-03-28 16:03:08.482482+00	2026-03-28 16:03:08.482482+00	INV-1774713788479	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774713788479	2026-03-28 16:03:08.479+00	\N	\N
f5081acc-7d8f-4714-ae77-b2a1a2ac007d	2026-03-28 16:25:50.07953+00	2026-03-28 16:25:50.07953+00	INV-1774715150075	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715150075	2026-03-28 16:25:50.075+00	\N	\N
d8e34580-fd70-4ed1-8815-012cb068aa2b	2026-03-28 16:28:24.490642+00	2026-03-28 16:28:24.490642+00	INV-1774715304488	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715304488	2026-03-28 16:28:24.488+00	\N	\N
8b2f53ab-932f-4c5d-a5ed-62af36afe268	2026-03-28 16:30:27.035092+00	2026-03-28 16:30:27.035092+00	INV-1774715427032	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715427032	2026-03-28 16:30:27.032+00	\N	\N
b466f074-4d6d-4142-a04c-728f66af9cc2	2026-03-28 16:31:10.964373+00	2026-03-28 16:31:10.964373+00	INV-1774715470960	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715470960	2026-03-28 16:31:10.96+00	\N	\N
3e4b04b9-d6c8-4f74-a6b5-a5c001de3141	2026-03-28 16:32:32.469622+00	2026-03-28 16:32:32.469622+00	INV-1774715552467	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715552467	2026-03-28 16:32:32.467+00	\N	\N
c8c0a056-f1ef-4fcc-a74b-064a73f287bc	2026-03-28 16:38:57.512952+00	2026-03-28 16:38:57.512952+00	INV-1774715937509	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774715937509	2026-03-28 16:38:57.509+00	\N	\N
15b3ea6c-7f5d-4917-8d65-42d26c15bc04	2026-03-28 16:49:06.619751+00	2026-03-28 16:49:06.619751+00	INV-1774716546619	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774716546619	2026-03-28 16:49:06.619+00	\N	\N
6cba92b9-25a2-4c25-86c6-b19a75607364	2026-03-28 16:52:26.91443+00	2026-03-28 16:52:26.91443+00	INV-1774716746911	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774716746911	2026-03-28 16:52:26.911+00	\N	\N
4a6ecd0c-60c0-40eb-8dd0-a79138eb0dd0	2026-03-28 16:57:10.536573+00	2026-03-28 16:57:10.536573+00	INV-1774717030536	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774717030536	2026-03-28 16:57:10.536+00	\N	\N
1aa73d48-1da3-4055-9ba4-0a45785e4c5c	2026-03-28 17:01:21.787514+00	2026-03-28 17:01:21.787514+00	INV-1774717281785	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774717281785	2026-03-28 17:01:21.785+00	\N	\N
3ac3c9cb-1de4-4965-8f50-c563d187c7b1	2026-03-28 17:07:21.201473+00	2026-03-28 17:07:21.201473+00	INV-1774717641197	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774717641197	2026-03-28 17:07:21.197+00	\N	\N
3275b075-d4a8-47f1-b91f-174f7e045f03	2026-03-28 17:16:33.820108+00	2026-03-28 17:16:33.820108+00	INV-1774718193816	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774718193816	2026-03-28 17:16:33.816+00	\N	\N
d3e6c097-5cd1-4396-a2e2-f3c944c3098c	2026-03-28 17:23:54.713785+00	2026-03-28 17:23:54.713785+00	INV-1774718634713	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774718634713	2026-03-28 17:23:54.713+00	\N	\N
7dace958-2cde-42f8-8922-62b1a98428b6	2026-03-28 17:26:59.914771+00	2026-03-28 17:26:59.914771+00	INV-1774718819911	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	pending	SUB-1774718819911	2026-03-28 17:26:59.911+00	\N	\N
705e28d3-cd4c-471a-b380-d5c6e53f1a1b	2026-03-28 17:31:06.325086+00	2026-03-28 17:31:33.508226+00	INV-1774719066321	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	completed	SUB-1774719066321	2026-03-28 17:31:06.321+00	\N	{"message": "Success from frontend"}
3efbaaed-f43d-4d93-8f67-551689819ac0	2026-03-28 17:37:53.225503+00	2026-03-28 17:38:01.769433+00	INV-1774719473225	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	completed	SUB-1774719473225	2026-03-28 17:37:53.225+00	\N	{"message": "Success from frontend"}
2455e4c7-71c6-4225-bb37-e7d8c2413016	2026-03-28 17:40:29.28223+00	2026-03-28 17:40:41.310585+00	INV-1774719629282	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	completed	SUB-1774719629282	2026-03-28 17:40:29.282+00	\N	{"message": "Success from frontend"}
edf20596-2a5a-4cf4-9de1-0a85166fa941	2026-03-28 17:46:00.713025+00	2026-03-28 17:46:12.079375+00	INV-1774719960709	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	failed	SUB-1774719960709	2026-03-28 17:46:00.709+00	\N	{"message": "Failure from frontend"}
75b4e700-6d5b-467e-860d-fbb2c85f0c32	2026-03-28 17:46:36.383448+00	2026-03-28 17:46:50.581073+00	INV-1774719996383	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	dade0864-80fc-453f-a37d-030d56e9254a	1.00	BDT	completed	SUB-1774719996383	2026-03-28 17:46:36.383+00	\N	{"message": "Success from frontend"}
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, created_at, updated_at, name, description, price, features, is_active, user_id, billing_cycle) FROM stdin;
dade0864-80fc-453f-a37d-030d56e9254a	2026-03-27 10:04:31.552145+00	2026-03-27 10:04:31.552145+00	Basic	Test Description	1.00	["featured"]	t	\N	monthly
f9771428-f36a-40ff-b4f1-bd327be9f3b8	2026-03-27 11:57:05.088917+00	2026-03-27 11:57:05.088917+00	pro	ddd	1.00	["eee"]	t	\N	monthly
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, created_at, updated_at, purchase_order_id, supplier_id, amount, payment_date, payment_method, transaction_id, note, tenant_id, user_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, created_at, updated_at, name, contact_name, email, phone, address, tenant_id, user_id) FROM stdin;
b5b35686-d31e-429f-9e98-29b248492038	2026-03-29 12:46:44.770533+00	2026-03-29 12:46:44.770533+00	Nice Lts	nike supper	nikesupper@gmail.com	+8801767163576	Jashore,jhikargacha	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	\N
\.


--
-- Data for Name: tenant_traffic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_traffic (id, created_at, updated_at, tenant_id, date, request_count, last_updated, user_id) FROM stdin;
ad93b0cf-f40a-47b1-a7da-2f0107fd5119	2026-03-28 15:12:48.95219+00	2026-03-28 15:12:48.95219+00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	2026-03-28	2289	2026-03-28 17:48:58.34281+00	\N
b52f936e-aed2-4e8a-8a5e-4a7920b5724d	2026-03-27 10:07:45.946411+00	2026-03-27 10:07:45.946411+00	b6affd2d-337f-43ba-9856-7c756c6b4034	2026-03-27	416	2026-03-27 12:51:00.117165+00	\N
42fb26c0-6146-42b7-8640-0ce08f7ab9ec	2026-03-28 14:54:50.296474+00	2026-03-28 14:54:50.296474+00	6b5d3b69-4c59-4e51-914a-429e5c6a2ba8	2026-03-28	6	2026-03-28 14:57:24.391395+00	\N
838aff3c-1594-4124-b4bb-86e3fd027f18	2026-03-28 12:49:33.773866+00	2026-03-28 12:49:33.773866+00	b6affd2d-337f-43ba-9856-7c756c6b4034	2026-03-28	12	2026-03-28 15:12:39.708994+00	\N
c9521f37-bb0a-4e78-971c-010484d6a05d	2026-03-30 01:08:25.058362+00	2026-03-30 01:08:25.058362+00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	2026-03-30	96	2026-03-30 01:13:09.783094+00	\N
795a1b5e-5dbf-499e-bdd9-a837c0f712c6	2026-03-29 12:44:03.347183+00	2026-03-29 12:44:03.347183+00	8b863fff-31ac-410f-ba1d-b4f1b6967aa3	2026-03-29	718	2026-03-29 15:37:02.115417+00	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, created_at, updated_at, store_name, subdomain, custom_domain, custom_domain_status, custom_domain_verified_at, status, ssl_enabled, subscription_plan_id, subscription_billing_cycle, subscription_status, subscription_starts_at, subscription_ends_at, user_id) FROM stdin;
8b863fff-31ac-410f-ba1d-b4f1b6967aa3	2026-03-28 15:12:36.545804+00	2026-03-28 17:46:50.587812+00	gowtam	gowtam	\N	pending	\N	active	f	dade0864-80fc-453f-a37d-030d56e9254a	monthly	active	2026-03-28 17:46:50.586+00	2026-04-27 17:46:50.586+00	e6a84035-65fe-446a-8552-574f452bd626
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, created_at, updated_at, name, email, username, password, phone, address, image, is_admin, is_email_verified, email_verification_token, reset_password_token, reset_password_expires, role, status, refresh_token, tenant_id) FROM stdin;
e6a84035-65fe-446a-8552-574f452bd626	2026-03-28 15:12:36.605375+00	2026-03-30 01:08:25.042503+00	gowtam	gowtam@gmail.com	gowtam	$2b$10$WiJ4v7Ou7ujNVI.4GFOKpezuhyQhm3jGTdPNnwgXWPZAnJXN72FWe	\N	\N	\N	f	f	33498a8395903666a2ee916e4afc6ab04ae1569b0681835178cb7a61968f69b0	\N	\N	admin	active	$2b$10$s6owQos09FbiAmUl8KhOP.qyfj/fd/Xq39EwTpPf1Igw/v84G.Ue.	8b863fff-31ac-410f-ba1d-b4f1b6967aa3
10a87818-c297-4348-83d9-8b57dec5f0cf	2026-03-27 09:21:11.040623+00	2026-03-28 18:03:40.388238+00	Super Admin	admin@gmail.com	admind	$2b$10$MPkrcwV9ZPKWvNyDAFFEN.Cyrym0uv29ha8Z2KB21guglCwPc52RK	\N	\N	\N	t	f	\N	\N	\N	super_admin	active	$2b$10$tJtqCec3MmsiwEpEGp4RPO38qdXK21l9B5G3y3HH/I1NTM0uUCpjO	\N
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, created_at, updated_at, user_id, product_id, tenant_id) FROM stdin;
\.


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

\unrestrict 0bUNnztUJFkweFzv5GXekTPLyjzRKq3QOTkoOeAmrjhwVKGWuZApRYr07v1hvPE

