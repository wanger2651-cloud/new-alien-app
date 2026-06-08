import type { TrackMapData } from '@/types/track'
import { ref } from 'vue'

const useTrackStore = defineStore(
  'track',
  () => {
    const mapDataList = ref<TrackMapData[]>([])

    /**
     * 添加mapData
     */
    const setMapDataList = (list: TrackMapData[]) => {
      mapDataList.value = list
    }

    return {
      mapDataList,
      setMapDataList
    }
  },
  {
    unistorage: true
  }
)

export default useTrackStore
