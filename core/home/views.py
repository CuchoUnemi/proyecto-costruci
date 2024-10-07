from django.shortcuts import redirect
from django.views.generic import TemplateView


class HomeTemplateView(TemplateView):
    template_name = 'homeI.html'

    # Validación de superusuario en el método dispatch
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_superuser:
            return redirect('home:admin_home')  # Redirige al home de administrador si es superusuario
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = {"title1": "IC - Inicio",
                   "title2": "Corporacion el Rosado"}
        return context


class AdminHomeTemplateView(TemplateView):
    template_name = 'admin_home.html'

    def get_context_data(self, **kwargs):
        context = {"title1": "Panel de Administración",
                   "title2": "Corporacion el Rosado - Admin"}
        return context
