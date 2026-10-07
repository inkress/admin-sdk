<?php
/**
 * Plugin Name: Inkress Commerce
 * Plugin URI:  https://inkress.com
 * Description: Official Inkress Commerce integration for WordPress. Seamlessly integrate Inkress payments and products into your WordPress site.
 * Version:     1.0.0
 * Author:      Inkress
 * Author URI:  https://inkress.com
 * License:     MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: inkress-commerce
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Tested up to: 6.4
 * 
 * @package Inkress_Commerce
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'INKRESS_VERSION', '1.0.0' );
define( 'INKRESS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'INKRESS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Main Inkress Commerce Class
 */
class Inkress_Commerce {

	/**
	 * Instance of this class.
	 *
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * Return an instance of this class.
	 *
	 * @return object A single instance of this class.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->includes();
		$this->init_hooks();
	}

	/**
	 * Include necessary files.
	 */
	private function includes() {
		require_once INKRESS_PLUGIN_DIR . 'includes/class-inkress-api.php';
		require_once INKRESS_PLUGIN_DIR . 'includes/class-inkress-frontend.php';
		require_once INKRESS_PLUGIN_DIR . 'includes/class-inkress-admin.php';
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		
		// Initialize components
		new Inkress_Frontend();
		if ( is_admin() ) {
			new Inkress_Admin();
		}
	}

	/**
	 * Add admin menu.
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Inkress Commerce', 'inkress-commerce' ),
			__( 'Inkress', 'inkress-commerce' ),
			'manage_options',
			'inkress-commerce',
			array( $this, 'render_admin_page' ),
			'dashicons-cart',
			56
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting( 'inkress_options', 'inkress_api_key' );
		register_setting( 'inkress_options', 'inkress_store_id' );
		register_setting( 'inkress_options', 'inkress_environment' );
	}

	/**
	 * Render admin page.
	 */
	public function render_admin_page() {
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( 'inkress_options' );
				do_settings_sections( 'inkress_options' );
				?>
				<table class="form-table">
					<tr valign="top">
						<th scope="row"><?php esc_html_e( 'API Key', 'inkress-commerce' ); ?></th>
						<td>
							<input type="password" name="inkress_api_key" value="<?php echo esc_attr( get_option( 'inkress_api_key' ) ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'Enter your Inkress API Key.', 'inkress-commerce' ); ?></p>
						</td>
					</tr>
					<tr valign="top">
						<th scope="row"><?php esc_html_e( 'Store ID', 'inkress-commerce' ); ?></th>
						<td>
							<input type="text" name="inkress_store_id" value="<?php echo esc_attr( get_option( 'inkress_store_id' ) ); ?>" class="regular-text" />
						</td>
					</tr>
					<tr valign="top">
						<th scope="row"><?php esc_html_e( 'Environment', 'inkress-commerce' ); ?></th>
						<td>
							<select name="inkress_environment">
								<option value="sandbox" <?php selected( get_option( 'inkress_environment' ), 'sandbox' ); ?>><?php esc_html_e( 'Sandbox', 'inkress-commerce' ); ?></option>
								<option value="production" <?php selected( get_option( 'inkress_environment' ), 'production' ); ?>><?php esc_html_e( 'Production', 'inkress-commerce' ); ?></option>
							</select>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}

// Initialize the plugin.
add_action( 'plugins_loaded', array( 'Inkress_Commerce', 'get_instance' ) );
