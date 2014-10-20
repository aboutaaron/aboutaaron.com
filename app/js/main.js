var container = document.getElementById('site-head');
var camera, scene, renderer, particle;
var mouseX = 0, mouseY = 0;
var windowHalfX = container.offsetWidth / 2;
var windowHalfY = container.offsetHeight / 2;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 1, 5000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();

    var material = new THREE.SpriteMaterial( {
        map: new THREE.Texture( generateSprite() ),
        blending: THREE.AdditiveBlending
    } );

    for ( var i = 0; i < 1000; i++ ) {

        particle = new THREE.Sprite( material );

        initParticle( particle, i * 10 );

        scene.add( particle );
    }

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0x000040 );
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    container.appendChild( renderer.domElement );

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    // document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    // //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = container.offsetWidth / 2;
    windowHalfY = container.offsetHeight / 2;

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth, container.offsetHeight );

}

function generateSprite() {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
    gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    return canvas;

}

function initParticle( particle, delay ) {

    var particle = this instanceof THREE.Sprite ? this : particle;
    var delay = delay !== undefined ? delay : 0;

    particle.position.set( 0, 0, 0 )
    particle.scale.x = particle.scale.y = Math.random() * 32 + 16;

    new TWEEN.Tween( particle )
        .delay( delay )
        .to( {}, 10000 )
        .onComplete( initParticle )
        .start();

    new TWEEN.Tween( particle.position )
        .delay( delay )
        .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
        .start();

    new TWEEN.Tween( particle.scale )
        .delay( delay )
        .to( { x: 0, y: 0 }, 10000 )
        .start();

}

//

function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

    }

}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

    }

}

//

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {

    TWEEN.update();

    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}
