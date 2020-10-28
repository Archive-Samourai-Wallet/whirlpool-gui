#!/usr/bin/env ruby

unless File.exists?("icons/1024x1024.png")
  STDERR.puts "Please create icons/1024x1024.png before running this script."
  exit 1
end

system "rm -f icon.ico icon.icns icon.png"

[16, 24, 32, 48, 64, 96, 128, 256, 512].each do |size|
  system "rm -f icons/#{size}x#{size}.png"
  system "convert -resize #{size}x#{size}! icons/1024x1024.png icons/#{size}x#{size}.png"
end

system "cp icons/256x256.png icon.png"

system <<-SYSTEM
  mkdir MyIcon.iconset
  sips -z 16 16     icons/1024x1024.png --out MyIcon.iconset/icon_16x16.png
  sips -z 32 32     icons/1024x1024.png --out MyIcon.iconset/icon_16x16@2x.png
  sips -z 32 32     icons/1024x1024.png --out MyIcon.iconset/icon_32x32.png
  sips -z 64 64     icons/1024x1024.png --out MyIcon.iconset/icon_32x32@2x.png
  sips -z 128 128   icons/1024x1024.png --out MyIcon.iconset/icon_128x128.png
  sips -z 256 256   icons/1024x1024.png --out MyIcon.iconset/icon_128x128@2x.png
  sips -z 256 256   icons/1024x1024.png --out MyIcon.iconset/icon_256x256.png
  sips -z 512 512   icons/1024x1024.png --out MyIcon.iconset/icon_256x256@2x.png
  sips -z 512 512   icons/1024x1024.png --out MyIcon.iconset/icon_512x512.png
  cp icons/1024x1024.png MyIcon.iconset/icon_512x512@2x.png
  iconutil -c icns -o icon.icns MyIcon.iconset
  convert icons/16x16.png icons/32x32.png icons/48x48.png icons/64x64.png icons/128x128.png icons/256x256.png icon.ico
  rm -R MyIcon.iconset
SYSTEM

system "cp icon.icns ../app/app.icns"
