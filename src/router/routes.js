
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    redirect: {name: 'upload-list'},
    children: [
      {
        path: 'uploads',
        name: 'upload-list',
        component: () => import('pages/UploadList'),
        children: [
          {
            path: ':uploadId',
            name: 'upload-detail',
            component: () => import('pages/UploadDetail'),
          },
        ]
      },
      {
        path: 'upload-create',
        name: 'upload-create',
        component: () => import('pages/UploadCreate'),
      },
      {
        path: 'receive-token/:token',
        name: 'receive-token',
        component: () => import('pages/FetchToken'),
      },
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
