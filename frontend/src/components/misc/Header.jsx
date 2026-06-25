import '../../styles/misc/header.css'
import BackButton from './BackButton'

export default function Header({ children, title = null, subtitle = null }) {

    return (

        <div className="component-header">
            <div>
                <h1 className='main-title'>
                    {title}
                </h1>
                <h1 className='sub-title'>
                    {subtitle}
                </h1>
            </div>

            <div className='rightContent'>
                {children}
            </div>
        </div>
    )
}
