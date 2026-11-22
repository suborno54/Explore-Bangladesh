EXPLORE BANGLADESH — CINEMATIC MOTION UPDATE

চালানোর নিয়ম
ZIP extract করে index.html খুলুন। index.html, style.css এবং script.js একই ফোল্ডারে রাখুন।
নিজের ছবি images ফোল্ডারে নিচের নামগুলোতে রাখুন। কোনো npm install, framework বা CDN দরকার নেই।
Embedded fonts এবং তাদের license আগের মতো রাখা হয়েছে।

কী বদলেছে
• Scroll down/up অনুযায়ী header hide/reveal; hero পার হলে solid background ও soft shadow।
• Navigation underline, mobile menu slide/fade, staggered links ও keyboard focus handling।
• Hero crossfade, managed 8-second Ken Burns zoom, staggered title ও gentle scroll cue।
• Once-only IntersectionObserver reveals, image masks এবং 27 places counter।
• Card lift/image zoom/arrow, button sweep/press/focus এবং save-heart pop।
• Filter changes-এ FLIP transitions, departing-card fade ও animated result count।
• চারটি existing scrolling story অক্ষত। Journey header-এর “Preview the four stories”
  button থেকে নতুন carousel খুলবে: next/previous, animated counter, 6-second progress
  এবং pause/play। Keyboard arrows দিয়েও গল্প বদলানো যায়।
• Native dialog/lightbox entrance ও exit fades; Escape/backdrop close; toast motion।
• Desktop hero ও sticky story images-এ gentle transform parallax, shared animation frame।
• Hidden tab/offscreen hero-তে autoplay/zoom pause; Reduced Motion-এ zoom, parallax,
  autoplay, animated counting ও stagger বন্ধ, simple fades থাকে।

রং, font এবং মূল page layout আগের সংস্করণের মতো রাখা হয়েছে।
নতুন CSS style.css-এর শেষের MOTION block-এ। JS-এ commented MOTION functions আছে।
কোনো animation library বা অন্য website-এর source code ব্যবহার করা হয়নি।
বর্তমান page-এ dropdown/mega menu বা accordion নেই। নতুন content section যোগ করা হয়নি।
Future native <details data-motion-accordion> element-এর জন্য accordion height/chevron
animation helper আছে। Dropdown-এর opt-in fade styles আছে; menu logic তৈরি করা হয়নি।

Motion tuning
style.css-এর final MOTION block-এর :root variables থেকে duration/easing বদলান:
--ease-out, --motion-medium, --motion-reveal, --motion-stagger,
--motion-crossfade, --motion-kenburns, --motion-story-interval, --motion-menu।
Hero slide interval script.js-এর HERO_SLIDE_INTERVAL_MS = 8000ms।
প্রতিটি active photo-তে পুরো 8-second zoom শেষ হওয়ার পর পরের slide crossfade হয়।

আগের features
27 destinations; division/district/type/search/sort ও budget filtering; saved places;
grid/list view; expandable gallery; destination details; map links; light/dark theme;
travel cost calculator; 1–7 day itinerary, notes, reorder, export এবং print/PDF।
Saved places, theme ও itinerary browser localStorage-এ থাকে।
Travel costs শিক্ষামূলক sample estimates; live prices নয়।

দ্রুত পরীক্ষা
1. Reload: headline line-by-line reveal; hero crossfade/zoom দেখুন।
2. Down/up scroll: header hide/reappear, reading progress, text/cards reveal ও 27 counter।
3. Desktop card hover/save: lift, image zoom, arrow ও heart pop; Tab দিয়ে focus ring দেখুন।
4. Division/district/search দ্রুত বদলান: correct results ও smooth fade/shift থাকবে।
5. Mobile width-এ Menu খুলুন/বন্ধ করুন; link entrance, Escape ও keyboard focus দেখুন।
6. Preview the four stories: autoplay/progress, arrows, pause/play, detail ও Escape পরীক্ষা করুন।
7. Gallery/destination details খুলুন; close button, Escape ও backdrop click পরীক্ষা করুন।
8. Calculator ও itinerary ব্যবহার করুন; gallery expand, theme এবং saved filter দেখুন।
9. OS/browser Reduced Motion চালু করুন: motion বন্ধ, manual controls কাজ করবে।
10. Hero থেকে নিচে scroll বা browser tab switch করুন: autoplay/zoom pause হবে।

Validation
Headless Chromium: desktop 1440px এবং mobile 390px/320px-এ পরীক্ষা করা হয়েছে।
Hero autoplay/zoom, directional header, carousel, rapid filters, save, dialogs, gallery,
calculator, itinerary, mobile inert/focus, reduced motion checks passed; no JS page errors.
Actual photo files were unavailable, so visual checks used the existing fallback illustrations.
Browsers and devices outside these checks may need additional testing.

PHOTO SETUP — PNG IMAGES

Extract the ZIP, then place your seven actual PNG photos inside the images folder.
Rename your files exactly as follows (all lowercase):

Ahsan Manzil.png          -> ahsan-manzil.png
Birishiri.png             -> birishiri.png
Cox’s Bazar Beach.png     -> coxs-bazar.png
Floating Guava Market.png -> swarupkathi.png
Jaflong.png               -> jaflong.png
Kantajew Temple.png       -> kantajew.png
Kuakata Sea Beach.png     -> kuakata.png

Windows: enable View > Show > File name extensions so names do not accidentally end in .png.png.
These paths are configured in DESTINATION_PHOTOS near the top of script.js.
The same photos will be used on destination cards, in the full gallery and in the detail dialog.
Click "Explore all 27 places" to expand the curated gallery.
Missing images automatically fall back to the existing illustration.
The hero cycles through all seven configured photos every 8 seconds, starting with Cox’s Bazar.
Order: Cox’s Bazar, Birishiri, Ahsan Manzil, Floating Guava Market, Jaflong, Kantajew Temple, Kuakata.
In script.js, change HERO_SLIDE_INTERVAL_MS = 8000 to 5000 for 5 seconds or 10000 for 10 seconds.
Change HERO_SLIDES to change the order; photo paths remain in DESTINATION_PHOTOS.
Use the banner arrows/dots to select a photo. The graphics and slideshow pause buttons have been removed.
Autoplay pauses for OS Reduced Motion, keyboard focus on
slideshow controls, a hidden browser tab, or when the banner is outside the viewport.
Missing photos retain their destination’s illustration. Actual photo files still need to be supplied.
The actual seven photo files are not included: only their screenshot was attached.
