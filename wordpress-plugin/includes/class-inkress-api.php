<?php
/**
 * Inkress API Handler
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inkress_API {

	private $api_key;
	private $store_id;
	private $api_url;

	public function __construct() {
		$this->api_key     = get_option( 'inkress_api_key' );
		$this->store_id    = get_option( 'inkress_store_id' );
		$environment       = get_option( 'inkress_environment', 'production' );
		
		$this->api_url = ( $environment === 'sandbox' ) 
			? 'https://api-dev.inkress.com/api/v1' 
			: 'https://api.inkress.com/api/v1';
	}

	/**
	 * Make a request to the Inkress API.
	 */
	private function request( $endpoint, $method = 'GET', $body = null ) {
		if ( empty( $this->api_key ) ) {
			return new WP_Error( 'missing_api_key', 'Inkress API Key is missing.' );
		}

		$url = $this->api_url . $endpoint;

		$args = array(
			'method'  => $method,
			'headers' => array(
				'Authorization' => 'Bearer ' . $this->api_key,
				'Content-Type'  => 'application/json',
			),
			'timeout' => 30,
		);

		if ( ! empty( $this->store_id ) ) {
			$args['headers']['Client-Id'] = 'm-' . $this->store_id;
		}

		if ( $body ) {
			$args['body'] = json_encode( $body );
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( $code >= 400 ) {
			return new WP_Error( 'api_error', isset( $data['message'] ) ? $data['message'] : 'Unknown API Error' );
		}

		return $data;
	}

	/**
	 * Get Products.
	 */
	public function get_products( $limit = 10 ) {
		return $this->request( '/products?limit=' . intval( $limit ) );
	}

	/**
	 * Get a single product.
	 */
	public function get_product( $id ) {
		return $this->request( '/products/' . intval( $id ) );
	}

	/**
	 * Get Orders.
	 */
	public function get_orders( $limit = 20, $page = 1 ) {
		return $this->request( '/orders?limit=' . intval( $limit ) . '&page=' . intval( $page ) );
	}

	/**
	 * Create a product.
	 */
	public function create_product( $data ) {
		return $this->request( '/products', 'POST', $data );
	}

	/**
	 * Update a product.
	 */
	public function update_product( $id, $data ) {
		return $this->request( '/products/' . intval( $id ), 'PUT', $data );
	}

	/**
	 * Delete a product.
	 */
	public function delete_product( $id ) {
		return $this->request( '/products/' . intval( $id ), 'DELETE' );
	}
}
