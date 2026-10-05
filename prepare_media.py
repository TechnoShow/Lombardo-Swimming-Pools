from pathlib import Path
from PIL import Image
import imageio_ffmpeg
import subprocess

root = Path(__file__).resolve().parent
assets = root / "assets"
ff = imageio_ffmpeg.get_ffmpeg_exe()

for folder in ["hero", "build", "finish"]:
    (assets / "frames" / folder).mkdir(parents=True, exist_ok=True)


def run(args):
    print(" ".join(args[:6]), "...")
    subprocess.check_call(args)


run([
    ff, "-y", "-i", str(assets / "build-raw.mp4"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-g", "1", "-keyint_min", "1",
    "-sc_threshold", "0", "-an",
    "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080",
    str(assets / "build-scrub.mp4"),
])
run([
    ff, "-y", "-i", str(assets / "finish-raw.mp4"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-g", "1", "-keyint_min", "1",
    "-sc_threshold", "0", "-an",
    "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080",
    str(assets / "finish-scrub.mp4"),
])
run([
    ff, "-y", "-i", str(assets / "build-raw.mp4"),
    "-vf", "fps=15,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720",
    "-q:v", "5", str(assets / "frames" / "build" / "%03d.jpg"),
])
run([
    ff, "-y", "-i", str(assets / "finish-raw.mp4"),
    "-vf", "fps=15,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720",
    "-q:v", "5", str(assets / "frames" / "finish" / "%03d.jpg"),
])

src = Image.open(assets / "hero.jpg").convert("RGB")
w, h = 1280, 720
base = src.resize((w, h), Image.Resampling.LANCZOS)
frames = 60
out = assets / "frames" / "hero"
for i in range(frames):
    t = i / (frames - 1)
    scale = 1.0 + 0.14 * t
    nw, nh = int(w * scale), int(h * scale)
    resized = base.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (nw - w) // 2 + int((nw - w) * 0.08 * t)
    y = int((nh - h) * 0.55 * t)
    crop = resized.crop((x, y, x + w, y + h))
    crop.save(out / f"{i + 1:03d}.jpg", quality=82, optimize=True)

run([
    ff, "-y", "-framerate", "15", "-i", str(assets / "frames" / "hero" / "%03d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-g", "1", "-keyint_min", "1",
    "-sc_threshold", "0", "-an", str(assets / "hero-scrub.mp4"),
])

for name in [
    "hero.jpg",
    "build.jpg",
    "finish.jpg",
    "service-pools.jpg",
    "service-spas.jpg",
    "service-renovations.jpg",
    "service-service.jpg",
]:
    p = assets / name
    im = Image.open(p).convert("RGB")
    im.thumbnail((1920, 1080))
    im.save(p, quality=86, optimize=True)
    print(name, p.stat().st_size)

print("hero", len(list((assets / "frames" / "hero").glob("*.jpg"))))
print("build", len(list((assets / "frames" / "build").glob("*.jpg"))))
print("finish", len(list((assets / "frames" / "finish").glob("*.jpg"))))
