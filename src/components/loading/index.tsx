'use client';
import './style.scss'
import { ProgressSpinner } from 'primereact/progressspinner';
const LoadingSpinner = () => {
  return (
    <div className='bg-audio-loading'>
      <div className="audio-loading" >
        {/* <Image src={IconLoadding} width={80} height={80} alt='loading'></Image>
         */}
         <ProgressSpinner />
      </div>
    </div>

  )
}

export default LoadingSpinner
