import os
import uuid
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from apps.content_management.models import HeroSlide, MedicalService

class Command(BaseCommand):
    help = 'Migrate seeded images from frontend/public to backend/media and update models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without doing anything',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        project_root = Path(settings.BASE_DIR).parent  # backend/../ -> vida/
        frontend_root = project_root / 'frontend' / 'public' / 'images'
        media_root = Path(settings.MEDIA_ROOT)

        self.stdout.write('=== MIGRATION SEED MEDIA ===')
        self.stdout.write(f'Frontend source: {frontend_root}')
        self.stdout.write(f'Backend media root: {media_root}')
        if dry_run:
            self.stdout.write('DRY RUN — no changes will be made')
        self.stdout.write('')

        # 1. Hero slides
        self.stdout.write('--- Hero Slides ---')
        hero_files = [
            ('hero-1-vision.jpg', 'hero/hero-1-vision.jpg'),
            ('hero-2-technology.png', 'hero/hero-2-technology.png'),
            ('hero-3-team.png', 'hero/hero-3-team.png'),
            ('hero-4-appointment.png', 'hero/hero-4-appointment.png'),
        ]
        for filename, target_path in hero_files:
            src = frontend_root / 'hero' / filename
            self._process_file(src, target_path, HeroSlide, 'image', dry_run)

        # 2. Medical services
        self.stdout.write('--- Medical Services ---')
        service_files = [
            ('consultation.png', 'services/consultation.png'),
            ('depistage.png', 'services/depistage.png'),
            ('lunetterie.png', 'services/lunetterie.png'),
            ('chirurgie.png', 'services/chirurgie.png'),
        ]
        for filename, target_path in service_files:
            src = frontend_root / 'services' / filename
            self._process_file(src, target_path, MedicalService, 'image', dry_run)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Migration completed.'))

    def _process_file(self, src_path: Path, target_rel_path: str, model_class, field_name: str, dry_run: bool):
        if not src_path.exists():
            self.stdout.write(self.style.ERROR(f'  Source not found: {src_path}'))
            return

        # Check if any instance uses this path (relative or absolute)
        # We'll match by filename or by relative path
        filename = src_path.name
        instances = model_class.objects.filter(
            **{f'{field_name}__contains': filename}
        )
        if not instances:
            self.stdout.write(f'  No {model_class.__name__} found for {filename}')
            return

        # Ensure target directories exist
        target_abs_path = Path(default_storage.path(target_rel_path))
        target_abs_path.parent.mkdir(parents=True, exist_ok=True)

        if dry_run:
            self.stdout.write(f'  [DRY] Would copy {src_path} -> {target_abs_path}')
            for inst in instances:
                self.stdout.write(f'    [DRY] Would update {inst.__class__.__name__} id={inst.id} {field_name} -> {target_rel_path}')
            return

        # Copy file to backend media
        with open(src_path, 'rb') as f:
            content = f.read()
        saved_path = default_storage.save(target_rel_path, ContentFile(content, name=src_path.name))
        self.stdout.write(f'  Copied to media: {saved_path}')

        # Update model instances
        updated = instances.update(**{field_name: saved_path})
        self.stdout.write(f'  Updated {updated} {model_class.__name__}(s) to use {saved_path}')
