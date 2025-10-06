#!/usr/bin/env python3
"""
Generate placeholder icon files for Chrome extension.
This creates simple colored PNG files as placeholders.
"""

import base64
from pathlib import Path

# Simple 1x1 PNG in base64 (transparent blue pixel)
# This is a valid minimal PNG file
PNG_BASE64_16 = """
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAcSURB
VDiNY/wPBAwUACYoTTYYNWDUABAYxRgDAGBSAgQWz8p7AAAAAElFTkSuQmCC
""".replace('\n', '')

PNG_BASE64_32 = """
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAdSURB
VFiF7cxBDQAACAMg+DdVz4z2Yn5fSVB3Cg0BqxEBuaJoS3sAAAAASUVORK5CYII=
""".replace('\n', '')

PNG_BASE64_48 = """
iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAeSURB
VGiB7cxBDQAACAMgsP/QXoZ7jw4RQVPQNQoNAbERAd4qRJJCAAAAAElFTkSuQmCC
""".replace('\n', '')

PNG_BASE64_128 = """
iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAfSURB
VHic7cxBEQAACAIwtH+1sTZrgEMMJBAICgUCQQGyEQH2nHH3hwAAAABJRU5ErkJggg==
""".replace('\n', '')

def create_icon(size: int, data: str):
    """Create a PNG icon file from base64 data."""
    icons_dir = Path(__file__).parent.parent / 'public' / 'icons'
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    icon_path = icons_dir / f'icon-{size}.png'
    icon_path.write_bytes(base64.b64decode(data))
    print(f'✓ Created {icon_path.name}')

if __name__ == '__main__':
    print('Creating placeholder icon files...')
    create_icon(16, PNG_BASE64_16)
    create_icon(32, PNG_BASE64_32)
    create_icon(48, PNG_BASE64_48)
    create_icon(128, PNG_BASE64_128)
    print('\n✅ All placeholder icons created!')
    print('⚠️  Replace these with actual designs later.')
