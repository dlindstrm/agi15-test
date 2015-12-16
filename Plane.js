function Plane(planeSize, worldWidth, worldDepth, x, y)
{
    this.geometry = new THREE.PlaneBufferGeometry( planeSize, planeSize, worldWidth - 1, worldDepth - 1 );
    this.geometry.rotateX( - Math.PI / 2 );
    var self = this;
    this.leftZ = [], this.botZ = [], this.topZ = [], this.rightZ = [];    
    this.data = this.generateHeight(worldWidth, worldDepth);    
    this.texture;
    this.mesh;  
    this.xPos = x;
    this.yPos = y;  

}

Plane.prototype.generateHeight = function(width, height) {

  var size = width * height, data = new Uint8Array( size ),
  perlin = new ImprovedNoise(), quality = 3, z = Math.random() * 100;

  for ( var j = 0; j < 2; j ++ ) {

    for ( var i = 0, k=worldWidth; i < size; i ++, k++ ) {

      var x = i % width, y = ~~ ( i / width );
      data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
  
      if(j==1){
      if(i < worldWidth) {
        this.leftZ.push(data[ i ]);
      }
      if(k == worldWidth) {
        this.botZ.push(data[ i ]);
        k=0;
      }
      if(k == worldWidth-1) {
        this.topZ.push(data[ i ]);
      }
      if(worldWidth*worldWidth-worldWidth-1 < i) {
        this.rightZ.push(data[ i ]);
      }   } 
    }
    quality *= 5;

  }
  return data;
}

Plane.prototype.setTexture = function() {
  var width = worldWidth, height = worldDepth;
  var canvas, canvasScaled, context, image, imageData,
  level, diff, vector3, sun, shade;
  vector3 = new THREE.Vector3( 0, 0, 0 );

  sun = new THREE.Vector3( 1, 1, 1 );
  sun.normalize();

  canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext( '2d' );
  context.fillStyle = '#000';
  context.fillRect( 0, 0, width, height );

  image = context.getImageData( 0, 0, canvas.width, canvas.height );
  imageData = image.data;

  for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

    vector3.x = this.data[ j - 2 ] - this.data[ j + 2 ];
    vector3.y = 2;
    vector3.z = this.data[ j - width * 2 ] - this.data[ j + width * 2 ];
    vector3.normalize();


    shade = vector3.dot( sun );

    imageData[ i ] = ( 96 + 128 ) * ( 0.5 + this.data[ j ] * 0.007 );
    imageData[ i + 1 ] = ( 32 +  96 ) * ( 0.5 + this.data[ j ] * 0.007 );
    imageData[ i + 2 ] = ( 96 ) * ( 0.5 + this.data[ j ] * 0.007 );
  }

  context.putImageData( image, 0, 0 );

  // Scaled 4x

  canvasScaled = document.createElement( 'canvas' );
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext( '2d' );
  context.scale( 4, 4 );
  context.drawImage( canvas, 0, 0 );

  image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
  imageData = image.data;

  for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

    var v = ~~ ( Math.random() * 5 );

    imageData[ i ] += v;
    imageData[ i + 1 ] += v;
    imageData[ i + 2 ] += v;

  }

  context.putImageData( image, 0, 0 );

  this.texture = canvasScaled;

}

Plane.prototype.setVertices = function() {
  var vertices = this.geometry.attributes.position.array;
        for ( var i = 0, j = 0, k=worldWidth, l = vertices.length; j < l; i ++, j += 3, k++ ) {
          vertices[ j + 1 ] = this.data[ i ] * 10;
        }
}

Plane.prototype.setMesh = function(texture) {
  this.mesh = new THREE.Mesh( this.geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
  this.mesh.position.x = this.xPos;
  this.mesh.position.z = this.yPos;
}