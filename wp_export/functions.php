<?php
/**
 * Astra Child Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 */

/**
 * Enqueue styles and scripts
 */
function astra_child_enqueue_scripts() {
    // Parent Style is engaged automatically by Astra usually, 
    // but just in case we need to explicitly queue child style if not auto-loaded.
    // Astra (parent) usually does it. If not, uncomment next line:
    // wp_enqueue_style( 'astra-parent-style', get_template_directory_uri() . '/style.css' );
    
    // Enqueue Child Style (Main CSS from our export)
    wp_enqueue_style( 
        'astra-child-style', 
        get_stylesheet_directory_uri() . '/style.css', 
        array('astra-theme-css'), 
        filemtime(get_stylesheet_directory() . '/style.css') 
    );

    // Font Awesome / Iconify (External)
    // We can enqueue the logical script using wp_enqueue_script for iconify
    wp_enqueue_script(
        'iconify-script', 
        'https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js', 
        array(), 
        '2.1.0', 
        false // in header
    );

    // Fonts - It's better to enqueue fonts properly
    wp_enqueue_style(
        'google-fonts-custom', 
        'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&family=Inter:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap', 
        array(), 
        null
    );

    // ————— CUSTOM SCRIPTS ————— 

    // Global App JS (Navigation, Auth Stub - if applicable globally)
    // wp_enqueue_script('app-js', get_stylesheet_directory_uri() . '/js/app.js', array(), '1.0', true);

    // 1. Home Page (Locked Features)
    // Adjust the check based on your actual Home page ID or URI
    if ( is_front_page() || is_home() ) {
        wp_enqueue_script(
            'locked-features-js', 
            get_stylesheet_directory_uri() . '/js/locked-features.js', 
            array(), 
            '1.0', 
            true // in footer
        );
        // app.js is mainly for non-WP nav, but if it has auth logic for "locked", include it too
        wp_enqueue_script(
            'app-js', 
            get_stylesheet_directory_uri() . '/js/app.js', 
            array(), 
            '1.0', 
            true
        );
    }

    // 2. Matrix Page
    if ( is_page('matrix') || is_page('matrix-result') ) {
        wp_enqueue_script(
            'matrix-js', 
            get_stylesheet_directory_uri() . '/js/matrix.js', 
            array(), 
            '1.0', 
            true
        );
    }

    // 3. Calendar Page
    if ( is_page('calendar') ) {
        wp_enqueue_script(
            'calendar-js', 
            get_stylesheet_directory_uri() . '/js/calendar.js', 
            array(), 
            '1.0', 
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'astra_child_enqueue_scripts' );

// Allow SVG uploads (often needed for icons)
function allow_svg_upload( $mimes ) {
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}
add_filter( 'upload_mimes', 'allow_svg_upload' );
