// engine/model-transform.js
//
// Shared helper applied by every model factory: positions and rotates
// the returned group according to the {variant, position, rotation}
// options passed by the spawner. Lives in engine/ (not in
// content/models/) so every factory can import it without a
// backreference into the content tree.

/**
 * Mutates `group` in-place to apply position + rotation + variant scaling.
 *
 * @param {THREE.Group} group
 * @param {object} opts
 * @param {"standard"|"boss"} [opts.variant]
 * @param {{x,y,z}} [opts.position]
 * @param {{x,y,z}} [opts.rotation]
 */
export function applyTransform(group, opts = {}) {
  const { position, rotation, variant } = opts;
  if (position) {
    group.position.set(position.x || 0, position.y || 0, position.z || 0);
  }
  if (rotation) {
    group.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
  }
  if (variant === "boss") {
    // Boss-tier geometry scales up. The per-factory scale factor is
    // exposed on `userData.bossScale`; this default is 1.6x which is
    // enough to read as a boss variant without breaking the camera
    // composition.
    group.scale.multiplyScalar(1.6);
  }
}