<?php
/**
 * Inkress Admin Handler
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inkress_Admin {

	private $api;

	public function __construct() {
		$this->api = new Inkress_API();
		add_action( 'admin_menu', array( $this, 'add_admin_menus' ) );
		add_action( 'admin_init', array( $this, 'handle_product_actions' ) );
	}

	public function add_admin_menus() {
		add_submenu_page(
			'inkress-commerce',
			__( 'Products', 'inkress-commerce' ),
			__( 'Products', 'inkress-commerce' ),
			'manage_options',
			'inkress-products',
			array( $this, 'render_products_page' )
		);

		add_submenu_page(
			'inkress-commerce',
			__( 'Orders', 'inkress-commerce' ),
			__( 'Orders', 'inkress-commerce' ),
			'manage_options',
			'inkress-orders',
			array( $this, 'render_orders_page' )
		);
	}

	public function handle_product_actions() {
		if ( ! isset( $_POST['inkress_action'] ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'inkress_product_action' ) ) {
			return;
		}

		$action = sanitize_text_field( $_POST['inkress_action'] );

		if ( 'create_product' === $action ) {
			$data = array(
				'title'     => sanitize_text_field( $_POST['title'] ),
				'price'     => intval( floatval( $_POST['price'] ) * 100 ), // Convert to cents
				'permalink' => sanitize_title( $_POST['permalink'] ),
				'teaser'    => sanitize_textarea_field( $_POST['teaser'] ),
				'image'     => esc_url_raw( $_POST['image'] ),
				'public'    => isset( $_POST['public'] ),
			);

			$response = $this->api->create_product( $data );

			if ( is_wp_error( $response ) ) {
				add_settings_error( 'inkress_messages', 'inkress_error', $response->get_error_message(), 'error' );
			} else {
				wp_redirect( add_query_arg( array( 'page' => 'inkress-products', 'message' => 'created' ), admin_url( 'admin.php' ) ) );
				exit;
			}
		} elseif ( 'update_product' === $action ) {
			$id = intval( $_POST['product_id'] );
			$data = array(
				'title'     => sanitize_text_field( $_POST['title'] ),
				'price'     => intval( floatval( $_POST['price'] ) * 100 ),
				'permalink' => sanitize_title( $_POST['permalink'] ),
				'teaser'    => sanitize_textarea_field( $_POST['teaser'] ),
				'image'     => esc_url_raw( $_POST['image'] ),
				'public'    => isset( $_POST['public'] ),
			);

			$response = $this->api->update_product( $id, $data );

			if ( is_wp_error( $response ) ) {
				add_settings_error( 'inkress_messages', 'inkress_error', $response->get_error_message(), 'error' );
			} else {
				wp_redirect( add_query_arg( array( 'page' => 'inkress-products', 'message' => 'updated' ), admin_url( 'admin.php' ) ) );
				exit;
			}
		} elseif ( 'delete_product' === $action ) {
			$id = intval( $_POST['product_id'] );
			$response = $this->api->delete_product( $id );

			if ( is_wp_error( $response ) ) {
				add_settings_error( 'inkress_messages', 'inkress_error', $response->get_error_message(), 'error' );
			} else {
				wp_redirect( add_query_arg( array( 'page' => 'inkress-products', 'message' => 'deleted' ), admin_url( 'admin.php' ) ) );
				exit;
			}
		}
	}

	public function render_products_page() {
		$action = isset( $_GET['action'] ) ? $_GET['action'] : 'list';
		$id     = isset( $_GET['id'] ) ? intval( $_GET['id'] ) : 0;

		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Inkress Products', 'inkress-commerce' ); ?></h1>
			<?php if ( 'list' === $action ) : ?>
				<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'inkress-products', 'action' => 'new' ), admin_url( 'admin.php' ) ) ); ?>" class="page-title-action"><?php esc_html_e( 'Add New', 'inkress-commerce' ); ?></a>
			<?php endif; ?>
			<hr class="wp-header-end">

			<?php
			if ( isset( $_GET['message'] ) ) {
				$messages = array(
					'created' => __( 'Product created successfully.', 'inkress-commerce' ),
					'updated' => __( 'Product updated successfully.', 'inkress-commerce' ),
					'deleted' => __( 'Product deleted successfully.', 'inkress-commerce' ),
				);
				if ( isset( $messages[ $_GET['message'] ] ) ) {
					echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $messages[ $_GET['message'] ] ) . '</p></div>';
				}
			}
			settings_errors( 'inkress_messages' );
			?>

			<?php
			if ( 'new' === $action || 'edit' === $action ) {
				$this->render_product_form( $id );
			} else {
				$this->render_product_list();
			}
			?>
		</div>
		<?php
	}

	private function render_product_list() {
		$products = $this->api->get_products( 20 );
		
		if ( is_wp_error( $products ) ) {
			echo '<div class="notice notice-error"><p>' . esc_html( $products->get_error_message() ) . '</p></div>';
			return;
		}
		?>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th width="50"><?php esc_html_e( 'ID', 'inkress-commerce' ); ?></th>
					<th width="80"><?php esc_html_e( 'Image', 'inkress-commerce' ); ?></th>
					<th><?php esc_html_e( 'Title', 'inkress-commerce' ); ?></th>
					<th><?php esc_html_e( 'Price', 'inkress-commerce' ); ?></th>
					<th><?php esc_html_e( 'Status', 'inkress-commerce' ); ?></th>
					<th><?php esc_html_e( 'Actions', 'inkress-commerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php if ( empty( $products['entries'] ) ) : ?>
					<tr><td colspan="6"><?php esc_html_e( 'No products found.', 'inkress-commerce' ); ?></td></tr>
				<?php else : ?>
					<?php foreach ( $products['entries'] as $product ) : ?>
						<tr>
							<td><?php echo esc_html( $product['id'] ); ?></td>
							<td>
								<?php if ( ! empty( $product['image'] ) ) : ?>
									<img src="<?php echo esc_url( $product['image'] ); ?>" style="width: 50px; height: 50px; object-fit: cover;">
								<?php endif; ?>
							</td>
							<td>
								<strong><?php echo esc_html( $product['title'] ); ?></strong><br>
								<small><?php echo esc_html( $product['permalink'] ); ?></small>
							</td>
							<td><?php echo esc_html( number_format( ($product['price'] ?? 0) / 100, 2 ) ); ?></td>
							<td>
								<?php if ( isset( $product['public'] ) && $product['public'] ) : ?>
									<span class="dashicons dashicons-visibility" title="Public"></span>
								<?php else : ?>
									<span class="dashicons dashicons-hidden" title="Private"></span>
								<?php endif; ?>
							</td>
							<td>
								<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'inkress-products', 'action' => 'edit', 'id' => $product['id'] ), admin_url( 'admin.php' ) ) ); ?>" class="button button-small"><?php esc_html_e( 'Edit', 'inkress-commerce' ); ?></a>
								<form method="post" style="display:inline-block;" onsubmit="return confirm('<?php esc_attr_e( 'Are you sure?', 'inkress-commerce' ); ?>');">
									<?php wp_nonce_field( 'inkress_product_action' ); ?>
									<input type="hidden" name="inkress_action" value="delete_product">
									<input type="hidden" name="product_id" value="<?php echo esc_attr( $product['id'] ); ?>">
									<button type="submit" class="button button-small button-link-delete"><?php esc_html_e( 'Delete', 'inkress-commerce' ); ?></button>
								</form>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
		<?php
	}

	private function render_product_form( $id = 0 ) {
		$product = array(
			'title'     => '',
			'price'     => '',
			'permalink' => '',
			'teaser'    => '',
			'image'     => '',
			'public'    => true,
		);

		$is_edit = $id > 0;

		if ( $is_edit ) {
			$response = $this->api->get_product( $id );
			if ( ! is_wp_error( $response ) ) {
				$product = $response;
				$product['price'] = isset( $product['price'] ) ? $product['price'] / 100 : 0;
			}
		}
		?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin.php?page=inkress-products' ) ); ?>">
			<?php wp_nonce_field( 'inkress_product_action' ); ?>
			<input type="hidden" name="inkress_action" value="<?php echo $is_edit ? 'update_product' : 'create_product'; ?>">
			<?php if ( $is_edit ) : ?>
				<input type="hidden" name="product_id" value="<?php echo esc_attr( $id ); ?>">
			<?php endif; ?>

			<table class="form-table">
				<tr>
					<th scope="row"><label for="title"><?php esc_html_e( 'Title', 'inkress-commerce' ); ?></label></th>
					<td><input type="text" name="title" id="title" value="<?php echo esc_attr( $product['title'] ); ?>" class="regular-text" required></td>
				</tr>
				<tr>
					<th scope="row"><label for="price"><?php esc_html_e( 'Price', 'inkress-commerce' ); ?></label></th>
					<td>
						<input type="number" name="price" id="price" value="<?php echo esc_attr( $product['price'] ); ?>" class="regular-text" step="0.01" required>
						<p class="description"><?php esc_html_e( 'Price in your currency (e.g. 10.00)', 'inkress-commerce' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="permalink"><?php esc_html_e( 'Permalink', 'inkress-commerce' ); ?></label></th>
					<td><input type="text" name="permalink" id="permalink" value="<?php echo esc_attr( $product['permalink'] ?? '' ); ?>" class="regular-text" required></td>
				</tr>
				<tr>
					<th scope="row"><label for="teaser"><?php esc_html_e( 'Teaser', 'inkress-commerce' ); ?></label></th>
					<td><textarea name="teaser" id="teaser" class="large-text" rows="3"><?php echo esc_textarea( $product['teaser'] ?? '' ); ?></textarea></td>
				</tr>
				<tr>
					<th scope="row"><label for="image"><?php esc_html_e( 'Image URL', 'inkress-commerce' ); ?></label></th>
					<td><input type="url" name="image" id="image" value="<?php echo esc_attr( $product['image'] ?? '' ); ?>" class="regular-text"></td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Visibility', 'inkress-commerce' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="public" <?php checked( isset( $product['public'] ) ? $product['public'] : true ); ?>>
							<?php esc_html_e( 'Public', 'inkress-commerce' ); ?>
						</label>
					</td>
				</tr>
			</table>

			<?php submit_button( $is_edit ? __( 'Update Product', 'inkress-commerce' ) : __( 'Create Product', 'inkress-commerce' ) ); ?>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=inkress-products' ) ); ?>" class="button button-secondary"><?php esc_html_e( 'Cancel', 'inkress-commerce' ); ?></a>
		</form>
		<?php
	}

	public function render_orders_page() {
		$page = isset( $_GET['paged'] ) ? max( 1, intval( $_GET['paged'] ) ) : 1;
		$limit = 20;
		$orders = $this->api->get_orders( $limit, $page );
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Inkress Orders', 'inkress-commerce' ); ?></h1>
			
			<?php if ( is_wp_error( $orders ) ) : ?>
				<div class="notice notice-error">
					<p><?php echo esc_html( $orders->get_error_message() ); ?></p>
				</div>
			<?php else : ?>
				
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Order ID', 'inkress-commerce' ); ?></th>
							<th><?php esc_html_e( 'Customer', 'inkress-commerce' ); ?></th>
							<th><?php esc_html_e( 'Total', 'inkress-commerce' ); ?></th>
							<th><?php esc_html_e( 'Status', 'inkress-commerce' ); ?></th>
							<th><?php esc_html_e( 'Date', 'inkress-commerce' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php if ( empty( $orders['entries'] ) ) : ?>
							<tr>
								<td colspan="5"><?php esc_html_e( 'No orders found.', 'inkress-commerce' ); ?></td>
							</tr>
						<?php else : ?>
							<?php foreach ( $orders['entries'] as $order ) : ?>
								<tr>
									<td>#<?php echo esc_html( $order['reference_id'] ?? $order['id'] ); ?></td>
									<td>
										<?php 
										// Assuming customer data structure, adjust based on actual API response
										echo esc_html( ($order['customer']['first_name'] ?? '') . ' ' . ($order['customer']['last_name'] ?? 'Guest') ); 
										?>
									</td>
									<td>
										<?php echo esc_html( number_format( ($order['total'] ?? 0) / 100, 2 ) ); ?>
									</td>
									<td>
										<span class="inkress-status inkress-status-<?php echo esc_attr( $order['status'] ); ?>">
											<?php echo esc_html( ucfirst( $order['status'] ?? 'unknown' ) ); ?>
										</span>
									</td>
									<td>
										<?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $order['inserted_at'] ?? 'now' ) ) ); ?>
									</td>
								</tr>
							<?php endforeach; ?>
						<?php endif; ?>
					</tbody>
				</table>

				<?php
				if ( isset( $orders['page_info'] ) ) {
					$total_pages = $orders['page_info']['total_pages'];
					$current_page = $orders['page_info']['current_page'];
					
					if ( $total_pages > 1 ) {
						echo '<div class="tablenav bottom"><div class="tablenav-pages">';
						echo paginate_links( array(
							'base'      => add_query_arg( 'paged', '%#%' ),
							'format'    => '',
							'prev_text' => __( '&laquo;', 'inkress-commerce' ),
							'next_text' => __( '&raquo;', 'inkress-commerce' ),
							'total'     => $total_pages,
							'current'   => $current_page,
						) );
						echo '</div></div>';
					}
				}
				?>

			<?php endif; ?>
		</div>
		<?php
	}
}
