import { redirect } from "react-router-dom";

async function BoardSettingsRedirectPage(props: any) {
  const params = await props.params
  redirect(`/dash/boards/${params.boarduuid}/general`)
}

export default BoardSettingsRedirectPage
