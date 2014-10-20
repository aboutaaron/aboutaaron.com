var App = App || {};
var container, stats;
var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color;
var mouseX = 0, mouseY = 0;

var windowHalfX = $('#site-head').width() / 2;
var windowHalfY = $('#site-head').height() / 2;
var animate =  function () {
    requestAnimationFrame( animate );
    App.render();
};

App = {
    blastoff: function  () {
        this.init();
        animate();
    },
    init: function () {
        var self = this;

        container = document.querySelector('#site-head');

        camera = new THREE.PerspectiveCamera( 75, $('#site-head').width() / $('#site-head').height(), 1, 3000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

        geometry = new THREE.Geometry();

        for ( i = 0; i < 20000; i ++ ) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;

            geometry.vertices.push( vertex );

        }

        parameters = [
            [ [1, 1, 0.5], 5 ],
            [ [0.95, 1, 0.5], 4 ],
            [ [0.90, 1, 0.5], 3 ],
            [ [0.85, 1, 0.5], 2 ],
            [ [0.80, 1, 0.5], 1 ]
        ];

        for ( i = 0; i < parameters.length; i ++ ) {

            color = parameters[i][0];
            var size  = parameters[i][1];

            materials[i] = new THREE.PointCloudMaterial( { size: size } );

            particles = new THREE.PointCloud( geometry, materials[i] );

            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add( particles );

        }

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( $('#site-head').width(), $('#site-head').height() );
        container.appendChild( renderer.domElement );
        $('canvas').addClass('three-js');

        document.addEventListener( 'mousemove', self.onDocumentMouseMove, false );
        window.addEventListener( 'resize', self.onWindowResize, false );
    },
    render: function () {
        var time = Date.now() * 0.00005;

        camera.position.x += ( mouseX - camera.position.x ) * 0.05;
        camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

        camera.lookAt( scene.position );

        for ( i = 0; i < scene.children.length; i ++ ) {

            var object = scene.children[ i ];

            if ( object instanceof THREE.PointCloud ) {

                object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

            }

        }

        for ( i = 0; i < materials.length; i ++ ) {

            color = parameters[i][0];

            h = ( 360 * ( color[0] + time ) % 360 ) / 360;
            materials[i].color.setHSL( h, color[1], color[2] );

        }

        renderer.render( scene, camera );
    },
    onWindowResize: function () {
        windowHalfX = $('#site-head').width() / 2;
        windowHalfY = $('#site-head').height() / 2;

        camera.aspect = $('#site-head').width() / $('#site-head').height();
        camera.updateProjectionMatrix();

        renderer.setSize( $('#site-head').width(), $('#site-head').height() );
    },
    onDocumentMouseMove: function (event ) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    },
}

jQuery(document).ready(function($) {
    App.blastoff();
});
