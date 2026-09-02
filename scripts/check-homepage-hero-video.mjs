import fs from 'node:fs'

const heroSourcePath = 'src/components/homepage/HomepageSections.tsx'
const mobileVideoPath = 'public/media/launch/home/urblo-hero-mobile.mp4'
const heroSource = fs.readFileSync(heroSourcePath, 'utf8')
const mobileVideo = fs.readFileSync(mobileVideoPath)

const requiredSourceContracts = [
  ['getWeixinJSBridge()', 'existing Weixin bridge detection'],
  ["bridge.invoke('getNetworkType', {}, attemptVideoPlay)", 'Weixin bridge playback unlock'],
  ["document.addEventListener('WeixinJSBridgeReady', handleWeixinJSBridgeReady)", 'late Weixin bridge readiness'],
  ["video.addEventListener('playing', handlePlaying)", 'successful playback state'],
  ['setVideoNeedsGesture(true)', 'blocked playback state'],
  ['onClick={attemptVideoPlay}', 'user-gesture playback control'],
]

for (const [contract, label] of requiredSourceContracts) {
  if (!heroSource.includes(contract)) {
    throw new Error(`Homepage hero video is missing ${label}`)
  }
}

const findBoxType = (type, startOffset = 0) =>
  mobileVideo.indexOf(Buffer.from(type, 'ascii'), startOffset)
const moovOffset = findBoxType('moov')
const mdatOffset = findBoxType('mdat')
const avc1Offset = findBoxType('avc1', moovOffset)
const avcCOffset = findBoxType('avcC', moovOffset)
const mdhdOffset = findBoxType('mdhd', moovOffset)
const sttsOffset = findBoxType('stts', moovOffset)

for (const [type, offset] of [
  ['moov', moovOffset],
  ['mdat', mdatOffset],
  ['avc1', avc1Offset],
  ['avcC', avcCOffset],
  ['mdhd', mdhdOffset],
  ['stts', sttsOffset],
]) {
  if (offset < 0) {
    throw new Error(`Mobile hero MP4 is missing required ${type} data`)
  }
}

if (moovOffset > mdatOffset) {
  throw new Error('Mobile hero MP4 must keep its moov atom before mdat for fast start')
}

const profile = mobileVideo[avcCOffset + 5]
const compatibility = mobileVideo[avcCOffset + 6]
const level = mobileVideo[avcCOffset + 7]
if (profile !== 66 || (compatibility & 0xc0) !== 0xc0 || level > 31) {
  throw new Error(
    `Mobile hero MP4 must be H.264 Constrained Baseline level <= 3.1; found profile=${profile}, compatibility=${compatibility}, level=${level}`,
  )
}

const width = mobileVideo.readUInt16BE(avc1Offset + 28)
const height = mobileVideo.readUInt16BE(avc1Offset + 30)
if (width !== 540 || height !== 960) {
  throw new Error(`Mobile hero MP4 must remain 540x960; found ${width}x${height}`)
}

const handlerTypes = []
let handlerOffset = findBoxType('hdlr', moovOffset)
while (handlerOffset >= 0 && handlerOffset < mdatOffset) {
  handlerTypes.push(mobileVideo.toString('ascii', handlerOffset + 12, handlerOffset + 16))
  handlerOffset = findBoxType('hdlr', handlerOffset + 4)
}

if (handlerTypes.includes('soun')) {
  throw new Error('Mobile hero MP4 must not contain an audio track')
}

const mdhdVersion = mobileVideo[mdhdOffset + 4]
const timescaleOffset = mdhdVersion === 1 ? mdhdOffset + 24 : mdhdOffset + 16
const timescale = mobileVideo.readUInt32BE(timescaleOffset)
const timingEntryCount = mobileVideo.readUInt32BE(sttsOffset + 8)
let totalFrames = 0
let totalDurationTicks = 0

for (let entryIndex = 0; entryIndex < timingEntryCount; entryIndex += 1) {
  const entryOffset = sttsOffset + 12 + entryIndex * 8
  const frameCount = mobileVideo.readUInt32BE(entryOffset)
  const frameDuration = mobileVideo.readUInt32BE(entryOffset + 4)
  totalFrames += frameCount
  totalDurationTicks += frameCount * frameDuration
}

const averageFrameRate = totalFrames / (totalDurationTicks / timescale)
if (Math.abs(averageFrameRate - 30) > 0.01) {
  throw new Error(`Mobile hero MP4 must remain 30fps; found ${averageFrameRate.toFixed(3)}fps`)
}

const maxMobileVideoBytes = 4 * 1024 * 1024
if (mobileVideo.length > maxMobileVideoBytes) {
  throw new Error(
    `Mobile hero MP4 exceeds the 4MB mobile delivery budget (${mobileVideo.length} bytes)`,
  )
}

console.log('Homepage hero video compatibility passed.')
console.log(
  `Mobile MP4: Constrained Baseline level ${level / 10}, ${width}x${height}, ${averageFrameRate.toFixed(0)}fps, no audio, fast start, ${(mobileVideo.length / 1024 / 1024).toFixed(2)}MB.`,
)
