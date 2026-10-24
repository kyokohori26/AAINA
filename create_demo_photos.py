import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_demo_photos():
    dirs = [
        os.path.abspath("demo_photos"),
        os.path.abspath("frontend/public/demo_photos")
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # 1. Handwritten Diary Page
    w, h = 800, 1000
    diary_img = Image.new("RGB", (w, h), color=(253, 250, 242)) # cream notebook paper
    draw = ImageDraw.Draw(diary_img)

    # Ruled lines
    line_spacing = 38
    for y in range(120, h - 60, line_spacing):
        draw.line([(60, y), (w - 40, y)], fill=(215, 226, 238), width=1)
    
    # Red margin line
    draw.line([(150, 60), (150, h - 40)], fill=(240, 180, 180), width=2)

    # Date and Title
    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_body = ImageFont.truetype("arial.ttf", 20)
        font_date = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_date = ImageFont.load_default()

    draw.text((w - 240, 75), "Saturday, Oct 24", fill=(100, 100, 120), font=font_date)
    draw.text((170, 125), "Dear Diary,", fill=(40, 45, 70), font=font_title)
    
    diary_lines = [
        "Today was quite an overwhelming day at work.",
        "Had back-to-back reviews and presentation prep with Rohan.",
        "I was feeling so anxious this morning before stepping into the room,",
        "my hands were actually trembling a little.",
        "But once we started, things slowly fell into place.",
        "Still, I'm carrying this quiet exhaustion in my chest tonight.",
        "Took a long walk in the evening, bought warm chai,",
        "and tried to remind myself that I'm doing the best I can.",
        "Tomorrow is another chance to breathe and reset.",
        "- Anushri"
    ]
    y_text = 163
    for line in diary_lines:
        draw.text((170, y_text), line, fill=(45, 52, 75), font=font_body)
        y_text += line_spacing

    for d in dirs:
        diary_img.save(os.path.join(d, "handwritten_diary.jpg"), quality=90)
    print("Created handwritten_diary.jpg")

    # 2. Chai Sketch / Drawing
    w, h = 800, 800
    chai_img = Image.new("RGB", (w, h), color=(248, 244, 235))
    draw = ImageDraw.Draw(chai_img)

    # Cozy warm table
    draw.rectangle([(80, 520), (720, 680)], fill=(225, 210, 190), outline=(190, 175, 155), width=2)
    # Open sketchbook under mug
    draw.polygon([(180, 480), (620, 480), (660, 620), (140, 620)], fill=(255, 253, 248), outline=(210, 205, 195), width=2)
    draw.line([(400, 480), (400, 620)], fill=(200, 190, 180), width=2) # book spine

    # Chai Cup saucer
    draw.ellipse([(280, 470), (520, 530)], fill=(240, 235, 225), outline=(140, 120, 100), width=3)
    # Cup body
    draw.polygon([(320, 360), (480, 360), (460, 490), (340, 490)], fill=(245, 240, 232), outline=(140, 120, 100), width=3)
    # Cup handle
    draw.arc([(460, 380), (520, 460)], 270, 90, fill=(140, 120, 100), width=4)
    # Chai liquid inside
    draw.ellipse([(330, 345), (470, 375)], fill=(196, 125, 75), outline=(140, 120, 100), width=2)
    # Cinnamon stick
    draw.line([(360, 330), (430, 400)], fill=(120, 65, 35), width=7)

    # Steam wisps
    draw.arc([(360, 240), (410, 320)], 180, 360, fill=(200, 190, 180), width=3)
    draw.arc([(410, 200), (460, 290)], 0, 180, fill=(200, 190, 180), width=3)
    draw.arc([(380, 160), (430, 230)], 180, 360, fill=(200, 190, 180), width=3)

    # Caption / note
    draw.text((290, 640), "sukoon: cutting chai & quiet thoughts", fill=(130, 110, 95), font=font_body)

    for d in dirs:
        chai_img.save(os.path.join(d, "drawing_chai.jpg"), quality=90)
    print("Created drawing_chai.jpg")

    # 3. Rainy Day Window Photo
    w, h = 800, 800
    rain_img = Image.new("RGB", (w, h), color=(35, 45, 60)) # deep twilight blue
    draw = ImageDraw.Draw(rain_img)

    # Gradient evening atmosphere
    for y in range(h):
        r = int(35 + (y / h) * 40)
        g = int(45 + (y / h) * 30)
        b = int(65 + (y / h) * 45)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Bokeh blurred city lights outside window
    bokeh_lights = [
        (150, 300, 60, (255, 200, 120, 120)),
        (350, 220, 80, (255, 180, 90, 90)),
        (580, 360, 70, (220, 140, 80, 100)),
        (220, 500, 50, (255, 220, 150, 110)),
        (480, 480, 95, (255, 160, 100, 85)),
        (650, 240, 45, (180, 210, 255, 90)),
    ]
    for bx, by, br, col in bokeh_lights:
        draw.ellipse([(bx - br, by - br), (bx + br, by + br)], fill=col[:3])

    # Blur background for glass window depth
    blurred = rain_img.filter(ImageFilter.GaussianBlur(radius=8))
    draw_glass = ImageDraw.Draw(blurred)

    # Window pane divider
    draw_glass.line([(w // 2, 0), (w // 2, h)], fill=(20, 25, 35), width=8)

    # Crisp rain droplets on glass
    import random
    random.seed(42)
    for _ in range(160):
        rx = random.randint(20, w - 20)
        ry = random.randint(20, h - 20)
        rlen = random.randint(4, 18)
        # Droplet streak
        draw_glass.ellipse([(rx, ry), (rx + 4, ry + rlen)], fill=(220, 235, 250), outline=(160, 180, 200))
        # Highlight glint
        draw_glass.point((rx + 1, ry + 2), fill=(255, 255, 255))

    for d in dirs:
        blurred.save(os.path.join(d, "rainy_day.jpg"), quality=90)
    print("Created rainy_day.jpg")

if __name__ == "__main__":
    create_demo_photos()
