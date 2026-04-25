import { useApp } from './store/app'
import { Layout } from './components/Layout'
import { ChatScreen } from './chat/ChatScreen'
import { PatientsScreen } from './patients/PatientsScreen'
import { LibraryScreen } from './library/LibraryScreen'
import { SettingsScreen } from './settings/SettingsScreen'
import './chat/tools'

export default function App() {
  const surface = useApp((s) => s.surface)
  return (
    <Layout>
      {surface === 'chat' && <ChatScreen />}
      {surface === 'patients' && <PatientsScreen />}
      {surface === 'library' && <LibraryScreen />}
      {surface === 'settings' && <SettingsScreen />}
    </Layout>
  )
}
