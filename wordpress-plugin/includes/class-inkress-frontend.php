<?php
/**
 * Inkress Frontend Handler (Shortcodes)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inkress_Frontend {

	private $api;

	public function __construct() {
		$this->api = new Inkress_API();
		add_shortcode( 'inkress_products', array( $this, 'render_products_list' ) );
		add_shortcode( 'inkress_product', array( $this, 'render_single_product' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	public function enqueue_styles() {
		wp_register_style( 'inkress-styles', false );
		wp_enqueue_style( 'inkress-styles' );
		wp_add_inline_style( 'inkress-styles', '
			.inkress-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
			.inkress-product-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
			.inkress-product-image { max-width: 100%; height: auto; margin-bottom: 10px; }
			.inkress-product-title { font-size: 1.2em; margin: 10px 0; }
			.inkress-product-price { font-weight: bold; color: #2c3e50; font-size: 1.1em; }
			.inkress-buy-button { display: inline-block; background: #0073aa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
			.inkress-buy-button:hover { background: #005177; color: white; }
		' );
	}

	/**
	 * Render [inkress_products] shortcode.
	 */
	public function render_products_list( $atts ) {
		$atts = shortcode_atts( array(
			'limit' => 10,
		), $atts );

		$response = $this->api->get_products( $atts['limit'] );

		if ( is_wp_error( $response ) ) {
			return '<p class="inkress-error">Error loading products: ' . esc_html( $response->get_error_message() ) . '</p>';
		}

		if ( empty( $response['entries'] ) ) {
			return '<p>No products found.</p>';
		}

		$output = '<div class="inkress-product-grid">';
		foreach ( $response['entries'] as $product ) {
			$output .= $this->get_product_html( $product );
		}
		$output .= '</div>';

		return $output;
	}

	/**
	 * Render [inkress_product id="123"] shortcode.
	 */
	public function render_single_product( $atts ) {
		$atts = shortcode_atts( array(
			'id' => 0,
		), $atts );

		if ( empty( $atts['id'] ) ) {
			return '';
		}

		$product = $this->api->get_product( $atts['id'] );

		if ( is_wp_error( $product ) ) {
			return '<p class="inkress-error">Error loading product.</p>';
		}

		return '<div class="inkress-single-product">' . $this->get_product_html( $product ) . '</div>';
	}

	/**
	 * Helper to generate product HTML card.
	 */
	private function get_product_html( $product ) {
		$image_url = ! empty( $product['image'] ) ? $product['image'] : 'https://via.placeholder.com/300';
		$price = isset( $product['price'] ) ? number_format( $product['price'] / 100, 2 ) : '0.00'; // Assuming price is in cents
		$currency = 'USD'; // Should come from API or settings
		$permalink = isset( $product['permalink'] ) ? $product['permalink'] : '#';

		return sprintf(
			'<div class="inkress-product-card">
				<img src="%s" alt="%s" class="inkress-product-image">
				<h3 class="inkress-product-title">%s</h3>
				<p class="inkress-product-price">%s %s</p>
				<a href="%s" class="inkress-buy-button" target="_blank">Buy Now</a>
			</div>',
			esc_url( $image_url ),
			esc_attr( $product['title'] ),
			esc_html( $product['title'] ),
			esc_html( $currency ),
			esc_html( $price ),
			esc_url( $permalink )
		);
	}
}
